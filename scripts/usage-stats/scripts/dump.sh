#!/bin/bash

source "utils.sh"

echo "<html><body><h1>Entire database</h1><pre>"

for i in `mysql -uroot -petrf5931 -e "show databases" | grep "^notwork_"`; do
	echo $i
	mysql -uroot -petrf5931 --table $i -e "select * from hits;"
	echo
done

echo "</pre></body></html>"
