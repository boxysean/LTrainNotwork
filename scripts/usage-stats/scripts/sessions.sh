#!/bin/bash

source "utils.sh"

for i in `mysqll "show databases" | grep "^notwork_"`; do
	echo $i
done
