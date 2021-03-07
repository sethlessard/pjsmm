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
    yarn test:unit:ci
else
    yarn test:unit
fi
