#!bin/sh

ulimit -Sv 100000 -Sf 20000

mkdir /outputs
ind=0
for filename in /test-cases/inputs/*.txt; do
  # ./MyProgram.exe "$filename" "Logs/$(basename "$filename" .txt)_Log$i.txt"
  echo output-$ind.txt
  timeout 1 python /source/main.py < $filename -k 4
  ind=$((ind+1))
done
