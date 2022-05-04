#!bin/sh

ulimit -Sv 100000 -Sf 20000

c++ --static /source/main.cpp -o /source/main

ind=0

for filename in /test-cases/inputs/*.txt; do
  # ./MyProgram.exe "$filename" "Logs/$(basename "$filename" .txt)_Log$i.txt"
  echo output-$ind.txt
  timeout 1 ./source/main < $filename
  ind=$((ind+1))
done
