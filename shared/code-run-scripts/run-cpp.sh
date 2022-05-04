#!bin/sh

ulimit -Sv 100000 -Sf 20000

c++ --static /source/main.cpp -o /source/main

timeout 1 ./source/main
