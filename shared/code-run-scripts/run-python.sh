#!bin/sh
ulimit -Sv 100000 -Sf 20000

timeout 1 python /source/main.py -k 4
