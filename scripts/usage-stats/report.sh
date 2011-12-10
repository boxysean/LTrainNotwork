#!/bin/bash

SESSION=notwork_$(date +%Y%m%d)

mkdir -p reports/$SESSION

cd scripts

. calls.sh > ../reports/$SESSION/calls.html
. dump.sh > ../reports/$SESSION/dump.html
