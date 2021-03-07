#!/bin/bash

USAGE="Usage: $0 [-c]

Options:
  -c                Run in CI mode"

ci=false

while getopts ":c" arg;
do
    case "$arg" in
        c)      ci=true;;
        [?])    echo "$USAGE"
                exit 1;;
    esac
done

if $ci ;
then
    ./scripts/test-unit.sh -c 
    ./scripts/test-integration.sh -c 
    ./scripts/test-e2e.sh -c 
else
    ./scripts/test-unit.sh 
    ./scripts/test-integration.sh
    ./scripts/test-e2e.sh
fi
