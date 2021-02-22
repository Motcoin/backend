#!/bin/bash

for (( c=11111; c<=11131; c++ ))
do  
  echo "Stopping Process on Port: $c"
  fuser -n tcp -k $c
done
exit 0