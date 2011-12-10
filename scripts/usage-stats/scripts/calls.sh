#!/bin/bash

source "utils.sh"

echo "<html><body><h1>Number of content hits per day</h1><pre>"

for i in `mysql -uroot -petrf5931 -e "show databases" | grep "^notwork_"`; do
	echo $i
	mysql -uroot -petrf5931 --table $i -e "select id content_id, count(*) hits from hits group by id;"
	echo
done

echo "</pre></body></html>"
