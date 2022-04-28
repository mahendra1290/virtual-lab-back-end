#!bin/sh

c++ --static /source/main.cpp -o /source/main
./source/main < /inputs/input.txt
