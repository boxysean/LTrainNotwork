# L Train Notwork Technical Documentation

## 0. Table of Contents

<ol>
<li>Hardware</li>
<ol type="a">
<li>Goals</li>
<li>Computers</li>
<li>Routers</li>
<li>Batteries and Inverters</li>
</ol>
<li>Hardware Configuration</li>
<ol type="a">
<li>Goals</li>
<li>Implementation</li>
</ol>
<li>Software</li>
<ol type="a">
<li>Goals</li>
<li>Node.js</li>
<li>Front-end</li>
<li>Back-end</li>
<li>News Feeds</li>
<li>User Statistics</li>
</ol>
</ol>

## 1. Hardware

### a. Goals

- Many people connected at once across half the train
- Run during morning rush hour on every train between Morgan Ave and 8th Ave stations
- Package the device in a neat fashion, so they are self contained and easy to work with

### b. Computers

We looked at the GuruPlug Server and DreamPlug as our computer options. We acquired one of each to play with early in the project. Their key hardware features are identical:

<table>
  <tr>
    <th>Computer</th>
    <th>GuruPlug Server</th>
    <th>DreamPlug</th>
  </tr>
  <tr>
    <td>Processor</td>
    <td>Kirkwood 1.2 GHz</td>
    <td>Kirkwood 1.2 GHz</td>
  </tr>
  <tr>
    <td>Memory</td>
    <td>512MB NAND, 512MB DDR2</td>
    <td>512MB NAND, 512MB DDR2</td>
  </tr>
  <tr>
    <td>WiFi</th>
    <td>yes</td>
    <td>yes</td>
  </tr>
  <tr>
    <td>USB 2.0 ports</td>
    <td>2</td>
    <td>2</td>
  </tr>
  <tr>
    <td>Ethernet ports</td>
    <td>1</td>
    <td>1</td>
  </tr>
</table>

While others [shy away](http://1wt.eu/articles/guruplug-slow-heater/) from the GuruPlug Server, we ended up picking it as our computer primarily because of its form factor. The device fit nicely in our container and was less of a risk to unplug when deployed. During ContactCon, James Vasile of [FreedomBox Foundation](http://www.freedomboxfoundation.org/) mentioned that the DreamPlug was essentially a layout reconfiguration of the GuruPlug Server to deal with overheating issues. So we expected heat to be an issue, but even enclosed in a box without much ventilation, the GuruPlug surprisingly did not overheat.

One key feature we originally intended to rely upon was the WiFi capabilities of the plug computers. We thought that not only would these function as our content server but also as our wireless router.

On a Saturday, two days before the launch, we held a 10 person test. There we learned that the GuruPlug has a hard limit of 8 max simultaneous connections. (Oops.) So we did some research and quick experiments and decided to add a wireless router to each package.

### c. Routers

The advantage of using the GuruPlug as the router was that we could run dnsmasq directly on the router. We configured dnsmasq to resolve every address to localhost (except apple.com, which was resolved to 0.0.0.0 to prevent iPhone oddities). In this configuration every web request was redirected to and handled by the GuruPlug. Therefore requests for google.com (or any other site) would return headers redirecting the web browser to ltrainnotwork.com (our intranet hostname) and displaying our intercept page.

We tried a variety of routers (Cisco, D-Link, Netgear) to see if we could find a standard firmware configuration that ultimately sent the user redirect headers for unexpected hostnames. Unfortunately we could not find a working configuration, so we started to look at DD-WRT and OpenWRT solutions. We did not have experience with these before, but we knew that *WRT projects were distributions of *nix that could run dnsmasq.

We decided to buy Netgear WNDR3700 (rev 2) routers on our friend [Dan Phiffer](http://www.google.com/url?q=http%3A%2F%2Fphiffer.org%2F&sa=D&sntz=1&usg=AFQjCNFLEVKBoQpVDrYAMGlQodR56ktUZg)'s suggestion. These routers were widely available at Staples and BestBuy and were simple to flash OpenWRT onto the device via the web interface. We also could think of other uses after the Notwork for this beefy router.

Each WNDR3700 was paired with a GuruPlug and ran dnsmasq to resolve all DNS requests to the GuruPlug's IP (each had a unique static IP).

	# file: /etc/dnsmasq.conf

	address=/apple.com/0.0.0.0
	address=/#/192.168.0.20

The maximum connections configuration limitation was resolved by adding the router. However, [researching this more](http://serverfault.com/questions/192905/whats-the-maximum-number-of-wifi-connections-for-a-single-wifi-router), we found the physical limitations of a single access point peg maximum connections somewhere around 20-25 connections.

Since we ran OpenWRT, we had access to radio transmission power configuration options and maxed it.

### d. Batteries and Inverters

The batteries purchased were 12V 5AH Rechargeable Sealed Lead Acid Battery ([Amazon](http://www.amazon.com/dp/B000WSIR14/ref=cm_sw_su_dp)).

The batteries were purchased under the assumption they would be powering the GuruPlug alone, which they could do for over 6.5 hours. But the late addition of a router to each package added more current draw and dropped our battery life to roughly 2 hours. Thankfully, this was the amount of time we had each computer deployed for.

The batteries were connected to an inverter. We used two types, and found that the Black & Decker PI100AB Inverter ([Amazon](http://www.amazon.com/dp/B000IG206I/ref=cm_sw_su_dp)) was the better of the two, as it was quieter, the fan seemed to be more stable, and most importantly, the fuses were readily available. This is important as connecting the inverter with polarity reveresed would blow the fuse. To connect the battery, we used a Battery Clip Power Adapter ([Amazon](http://www.amazon.com/dp/B003IBX66I/ref=cm_sw_su_dp)), replacing the alligator clips with insulated female quick disconnect terminals (This is an example: Amazon. The right size depends on the gauge of the wire). Be sure to add the terminals with the proper crimping tool ([Amazon](http://www.amazon.com/dp/B00004SBDH/ref=cm_sw_su_dp)).

To recharge the batteries, we also used the  Yuasa 12 Volt Smart Shot 900 Battery Charger ([Amazon](http://www.amazon.com/dp/B001DD13Y0/ref=cm_sw_su_dp))

We also used Split Loom Tubing ([Amazon](http://www.amazon.com/dp/B0017686ZC/ref=cm_sw_su_dp)) for cable management.

## 2. Hardware Configuration

### a. Goals

- Make it as easy as possible to launch, update, extract data, and fix bugs

### b. Implementation

Since we had a 12 computers deployed and one technician, it was vital to streamline the process of updating code and content, extracting data, and fixing bugs on the computers. We used an online web server as a master server that the computers polled for new launch execution scripts each time the computers were booted. Thus the process of updating, extracting, and fixing bugs simply was

1. configure the launch execution script on the master server,
2. plug power and Ethernet in computer,
3. wait until boot process completes -- proceed to step 2 on the next computer using available plugs,
4. unplug computer.

With all the parallelization, we only took 15 minutes to go through this process with 12 computers.

Specifically, the computers were configured via the /etc/rc.local boot script to run an init.sh script that does the following:

1. if Internet, download the setup.sh script from the master server, and
2. run the setup.sh script.

The script:

	# file: init.sh
	
	INTERNET=$(./internet.sh)
	
	if [[ $INTERNET -eq 1 ]]; then
	    rsync -avzp user@masterserver.com:/home/user/notwork/setup.sh setup-new.sh
	    if [[ -e setup-new.sh ]]; then
	            mv setup.sh setup.sh.bak
	            mv setup-new.sh setup.sh
	    fi
	fi
	
	source setup.sh

Internet check script:

	# file: internet.sh
	
	INTERNET_IP=\$(ip r | grep default | cut -d ' ' -f 3)
	
	if [[ ${#INTERNET_IP} -eq 0 ]]; then
	    echo 0
	else
	    ping -q -w 1 -c 1 google.com > /dev/null && echo 1 || echo 0
	fi

The server deployment setup.sh script:

1. starts and stops required services,
2. if Internet, downloads new code and content,
3. configures and launches the web server, and
4. if Internet, send diagnostic information to the master server.

The script:

    # file: setup.sh

    echo "### starting boot process"
    
    ID=$(grep "computer:" /home/user/about | cut -d " " -f2)
    IP=$(grep "ip:" /home/user/about | cut -d " " -f2)
    
    echo "### ID $ID IP $IP"
    
    INTERNET=$(/home/user/internet.sh)
    
    if [[ $INTERNET -eq 1 ]]; then
        echo "there is internet"
    else
        echo "there is no internet"
    fi
    
    echo "### launching loopback and mysql"
    
    ifconfig lo up
    /etc/init.d/mysql start
    
    # We always bootup in AP mode. Delete any stale files
    rm -f /etc/wlanclient.mode
    #SSID=Plug2-uAP-`ifconfig eth0 | awk -F ":" '/HWaddr/ {print $6$7}'`
    
    if [[ $INTERNET -eq 1 ]]; then
        SSID="L Train Notwork $ID wI"
    else
        SSID="L Train Notwork $ID"
    fi
    
    insmod /root/uap8xxx.ko
    #ifconfig uap0 192.168.1.1 up
    /usr/bin/uaputl sys_cfg_ssid "$SSID"
    /usr/bin/uaputl sys_cfg_tx_power 20
    #/usr/bin/uaputl bss_start
    /usr/bin/uaputl bss_stop
    iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
    iptables -t nat -A POSTROUTING -o ppp0 -j MASQUERADE
    echo 1 > /proc/sys/net/ipv4/ip_forward
    /etc/init.d/udhcpd start
    /etc/init.d/dnsmasq stop
    #dnsmasq -z -2 -i uap0 -a 192.168.1.1 --address=/\#/192.168.1.1 --address=/apple.com/0.0.0.0
    iptables -A INPUT -i uap0 -p tcp -m tcp --dport 80 -j ACCEPT

    # Re-enable bluetooth. In the earlier case, it didn't find the firmware.
    #rmmod libertas_sdio libertas btmrvl_sdio btmrvl bluetooth 2>/dev/null
    #rmmod btmrvl_sdio btmrvl
    #/etc/init.d/bluetooth start

    #modprobe btmrvl_sdio
    #hciconfig hci0 up
    #hciconfig hci0 piscan
    #/usr/bin/mute-agent &

    # Set leds
    echo 1 > `eval ls /sys/class/leds/*plug*\:green\:health/brightness`
    echo 1 > `eval ls /sys/class/leds/*plug*\:green\:wmode/brightness`
    
    # stop lighttpd
    echo "stopping lighttpd"
    sudo /etc/init.d/lighttpd stop

    # start notwork
    echo "launching node"
    cd /home/user/workspace/notwork
    
    if [[ $INTERNET -eq 1 ]]; then
        ./scripts/update
    fi
    
    echo "### make config file"

    cat <<EOD > /home/user/workspace/notwork/config.yaml
    mysqlUser: mysqluser
    mysqlPass: mysqlpass
    hardwareId: "notwork$ID"
    authentication: false
    port: 80
    mode: production
    EOD
    
    ./scripts/launch
    ps alx | grep node
    
    echo "### config.yaml"
    cat /home/user/workspace/notwork/config.yaml
    
    # diagnostics
    df -h
    ifconfig
    
    # rsync all syslog and runtime logs to master server
    if [[ $INTERNET -eq 1 ]]; then
            rsync /var/log/syslog* user@masterserver.com:/home/user/notwork/notwork$ID/
            rsync /home/user/notwork/logs/* user@masterserver.com:/home/user/notwork/notwork$ID/
            echo "sent logs to mothership"
    fi
    
    echo "boot process complete"

The data extraction setup.sh script:

1. dump backend MySQL database into a file, and
2. rsync MySQL dump file to master server. (Then combine everything on the master server.)

The script:

    # file: setup.sh
    
    # This is called from /etc/rc.local to perform the initial setup.
    
    echo "### launch mysql"
    
    ifconfig lo up
    /etc/init.d/mysql start
    
    echo "### starting mysql process"
    
    ID=$(grep "computer:" /home/user/about | cut -d " " -f2)
    IP=$(grep "ip:" /home/user/about | cut -d " " -f2)
    
    echo "### ID $ID IP $IP"
    
    INTERNET=$(/home/user/internet.sh)
    
    if [[ $INTERNET -eq 1 ]]; then
            echo "### sending mysql"
            mysqldump -umysqluser -pmysqlpass notwork_db | grep -v "PRIMARY" | grep -v "DROP TABLE" | sed "s/auto_increment//" | sed "s/CREATE TABLE/CREATE TABLE IF NOT EXISTS/" | sed "s/\(  \`text\` tinytext NOT NULL\),/\1/" | sed "s/\(  \`title\` varchar(255) NOT NULL\),/\1/" | sed "s/\(  \`message\` text NOT NULL\),/\1/" | sed "s/\(  \`feedback\` text NOT NULL\),/\1/" | sed "s/\(  \`contentId\` int(11) NOT NULL\),/\1/" | sed "s/\(  \`username\` varchar(255) NOT NULL\),/\1/" | ssh user@masterserver.com "cat - > /home/user/notwork/mysql/$ID.dump"
    else
            echo "### no internets"
    fi
    
    echo "### mysql process complete"

## 3. Software

### a. Goals

- 'App-like' interface with interesting content and interactive applications
- Provide up-to-date news from popular sources
- Compile information and generate statistics about daily usage patterns

### b. Node.js

We decided to use Node.js with express as our model-view-controller (MVC) for a few reasons:

- both our frontend and backend developers could code in JavaScript,
- the socket.io and now.js libraries and examples to allow for chatrooms and other interactive applications within the browser,
- existence of open libraries to solve most of our problems, and
- it was a nice framework to separate code between the front-end and back-end developer.

We chose this approach over using an existing content management system (CMS) because:

- we were targetting mobile phones exclusively,
- we had unique requirements for interactive apps, and these could be built in directly to the express framework, and
- our content was static so we didn't require the sophistication of a CMS.

### c. Front-end

We used a variety of methods to make the front-end experience feel fast. One standard way we did this was using [JQueryMobile](http://jquerymobile.com/) to facilitate what appear to be page transfers within the same document.

User content requests and content list requests are made using AJAX calls. When the calls return, the front end replaces the contents of DIV tags and the content page is shown to the user. Content is cached on the users' browser, so revisiting the same content did not require additional requests.

Since one of our content areas was visual arts (and xkcd!), we sought a great photo gallery library and found one in [PhotoSwipe](http://www.photoswipe.com/) because of its great native app look and feel.

### d. Back-end

We kept the content in structured folders with meta content files. The file structure is expected by parsers in order to translate to the front-end structure. The parsers run at web server launch to precompute JSON responses to content list requests.

### e. News Feeds

We decided the best free and legal way to provide up-to-date news was via RSS feed headlines. Most websites declare in their terms of services that the content of RSS may be freely distributed.

The RSS standard worked beautifully for us because we were able to create short individual Python classes that extended one base class for parsing each RSS feed. The action of generating the news of the day was hence boiled down to a handful of Python scripts that were called using GNU Make.

	$ pwd
	/Users/boxysean/Documents/workspace/notwork/scripts/content-gen
	$ make clear && make && make install

We used Python's feedparser library to hash out the RSS structure and BeautifulSoup to detect the image tags, which were automatically downloaded and replaced with tags to intranet locations.

As providing a link to a website while on the subway would not have allowed the user to go to the site, we ended each article with a mailto link. When clicked, a "compose new mail message" screen appeared with a pre-populated body containing the link and instructions on how to send themselves the link in email, so they could read the rest of the article when they had true Internet access

	To:
	Subject: [ltrainnotwork.com] Link to article about puppies

	~^*^~
	Send this article to yourself by entering your email address in the to field above.
	Hit send, and it will show up in your inbox when you connect to the real internet once you get off the train.
	~^*^~

	Link to article about puppies from the L train notwork.
	http://www.dailypuppy.com/

The most popular RSS feeds contain a few methods of logging hits. We removed these in the feed generation process because it was impossible to fulfill these calls underground.

Some feeds were special. For example, we expanded upon a bash script we found online that downloads xkcd comics and inserts the image title underneath. Also our Explore github feed was a scrape of the online [Explore github](https://github.com/explore) page.

### f. User Statistics

We logged calls to our server for the purpose of generating user statistics, use cases, and understanding how the system was being used.

We stipulated in the terms of service that information we gathered could be shared, but privacy was one of our foremost concerns and, we think, was well-respected. We did not request nor store any personal information including credit card numbers, phone number, addresses, passwords, etc. We did not attempt to look for any special signifiers, such as MAC addresses.

The reason we stipulated this in the terms was to reserve the right to release information about usage of the Notwork.

What precisely we stored was:

- chat logs
- chat profiles
- content requests

We assigned each user a unique ID stored in a cookie. This unique ID was saved across all forms to get a notion of unique user interaction. The cookie expired within 14 hours, so the next day the same user would be assigned a new ID.

Note: We tried using Connect's session framework for Node.js, but ultimately we could not get that framework to run on our hardware. See [this thread](https://github.com/hbons/SparkleShare-Dashboard/issues/26#issuecomment-2810933).

Since we logged only calls to our server, we did not get a granular look at the way a user interacted with the interface. For example, we did not have a notion of how long a user stayed on chat nor how long a particular piece of content was viewed. (These are common statistics gathered on present-day websites.) This is an area of upgrade, but sufficed for our purposes.

If a user filled out a chat profile, we were able to tie the unique ID with the chat profile information. Keeping in mind that chat was also a real time missed connections, chat profile questions were:

- age range
- orientation
- gender
- what red means to you (e.g., #FF0000, 630-740 nm, etc.)
- favorite sort of cake
- user name (only required information)

Hence, if we chose to, we could possibly investigate the favorite content of users who liked cheesecake the most.

We used a MySQL backend to store this information because of the backend developer's familiarity with the database. Each table was configured as MyISAM and used mostly append-only calls. Thus MySQL functioned as a queryable log file and wasn't a system burden.

The two forms we had on the page, the 404 not found form and the contact us form, also used the MySQL log.

