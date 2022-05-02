#!bin/sh

cd /source

javac Main.java

ind=0

for filename in /test-cases/inputs/*.txt; do
  # ./MyProgram.exe "$filename" "Logs/$(basename "$filename" .txt)_Log$i.txt"
  echo output-$ind.txt
  java Main < $filename
  ind=$((ind+1))
done
