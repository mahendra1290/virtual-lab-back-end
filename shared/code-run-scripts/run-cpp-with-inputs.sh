#!bin/sh

c++ --static /source/main.cpp -o /source/main

ind=0

for filename in /test-cases/inputs/*.txt; do
  # ./MyProgram.exe "$filename" "Logs/$(basename "$filename" .txt)_Log$i.txt"
  echo output-$ind.txt
  ./source/main < $filename
  ind=$((ind+1))
done
