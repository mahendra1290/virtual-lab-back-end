#!bin/sh

mkdir /outputs
ind=0
for filename in /test-cases/inputs/*.txt; do
  # ./MyProgram.exe "$filename" "Logs/$(basename "$filename" .txt)_Log$i.txt"
  echo output-$ind.txt
  python /source/main.py < $filename
  ind=$((ind+1))
done
