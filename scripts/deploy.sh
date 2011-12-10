#!/bin/bash

# This file was used on GuruPlugs to configure them in as few as steps as possible to have them run the L Train Notwork code

ID=$1
IP=$2

echo "### is there an about file already?"

if [[ -e ~/about ]]; then
	echo "about file exists"
	return
fi

echo "### about file for easy knowing where we are"

cat <<EOD > ~/about
computer: $ID
ip: $IP
EOD

echo "### erase extra line in apt sources list"

cat <<EOD > /etc/apt/sources.list
deb http://ftp.us.debian.org/debian/ lenny main contrib non-free
deb http://http.us.debian.org/debian stable main contrib non-free
deb http://security.debian.org lenny/updates main contrib non-free
deb http://www.backports.org/debian lenny-backports main contrib non-free
EOD

echo "### update necessary packages"

dpkg --configure -a
apt-get --fix-missing update 
apt-get --fix-missing -y --force-yes install ntp g++ libssl-dev openssl make dstat curl iotop pkg-config screen rsync mercurial
apt-get --fix-missing -y --force-yes upgrade

echo "### get proper time via ntp and don't let ntp start henceforth"

/etc/init.d/ntp restart
dpkg-reconfigure tzdata
update-rc.d -f ntp remove

echo "### change samba name"

sed -ibak "s/mywifiplug/notwork$ID/" /etc/samba/smb.conf

echo "### use init_setup.sh better and make init.sh and setup.sh"

mv init_setup.sh init_setup.sh.bak

cat <<EOD > internet.sh
#!/bin/bash

INTERNET_IP=\$(ip r | grep default | cut -d ' ' -f 3)

if [[ \${#INTERNET_IP} -eq 0 ]]; then
        echo 0
else
        ping -q -w 1 -c 1 google.com > /dev/null && echo 1 || echo 0
fi
EOD

cat <<EOD > init.sh
#!/bin/bash

echo "### prep internet"
ifconfig eth0 $IP netmask 255.255.255.0 up
route add default gw 192.168.0.1

cd /root

INTERNET=\$(./internet.sh)

if [[ \$INTERNET -eq 1 ]]; then
        rsync -avzp user@masterserver.com:/root/notwork/setup.sh setup-new.sh
        if [[ -e setup-new.sh ]]; then
                mv setup.sh setup.sh.bak
                mv setup-new.sh setup.sh
        fi
fi

source setup.sh
EOD

chmod +x internet.sh init.sh

echo "### update rc.local so that it catches all logging"

mv /etc/rc.local /etc/rc.local.bak
cat <<EOD > /etc/rc.local
#!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.



mount -a
mkdir -p /var/cache/apt/archives/partial

export PATH=$PATH:/usr/local/bin/

/root/init.sh 2>&1 | logger -t notworkboot
EOD

chmod +x /etc/rc.local

echo "### make a nice static IP"

cat <<EOD > /etc/network/interfaces
# Used by ifup(8) and ifdown(8). See the interfaces(5) manpage or
# /usr/share/doc/ifupdown/examples for more information.
auto lo
iface lo inet loopback

auto eth0
   iface eth0 inet static
           address $IP
           netmask 255.255.255.0
           gateway 192.168.0.1
           network 192.168.0.0
           broadcast 192.168.1.255
EOD

echo "### install node"

cd ~
mkdir -p workspace
cd workspace
wget http://nodejs.org/dist/node-v0.4.12.tar.gz
tar xfz node-v0.4.12.tar.gz
cd node-v0.4.12
export CCFLAGS="-march=armv5t"
./configure
make
make install

echo "### install npm and forever and node-proxy"

curl http://npmjs.org/install.sh | sh 
# npm is dumb on these computers for whatever reason https://github.com/isaacs/npm/issues/1407
npm config set registry http://registry.npmjs.org/
npm-g install forever
npm-g install node-proxy

echo "### change mysql password"

mysqladmin -u root -pnosoup4u password newpass

echo "### make config file"

cat <<EOD > ~/workspace/notwork/config.yaml
mysqlUser: mysqluser
mysqlPass: mysqlpass
hardwareId: "notwork$ID"
authentication: false
port: 80
mode: production
EOD

echo "### change hostname"

echo "notwork$ID" > /etc/hostname
echo "127.0.0.1 notwork$ID" >> /etc/hosts

echo "### add rss keygen"

ssh-keygen
cat ~/.ssh/id_rsa.pub | ssh user@masterserver.com "cat >> ~/.ssh/authorized_keys"

echo "### set hardware clock"

/sbin/hwclock --systohc

echo "### setup network"

#ifconfig eth0 $IP netmask 255.255.255.0 up
#route add default gw 192.168.0.1

echo "### clean up"

apt-get clean
rm -r /usr/share/doc
rm -r /root/workspace/node*

echo "### finished. reboot this computer to complete installation"
