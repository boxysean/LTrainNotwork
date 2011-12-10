#!/bin/bash

SESSION=notwork_$(date +%Y%m%d)

mkdir -p $SESSION

. calls.sh > $SESSION/calls.html
