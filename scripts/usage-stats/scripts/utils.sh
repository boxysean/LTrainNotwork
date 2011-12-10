#!/bin/bash

USER=root
PASSWORD=etrf5931

function mysqll {
	echo "mysql -u$USER -p$PASSWORD $@"
	mysql -u$USER -p$PASSWORD $@
}
