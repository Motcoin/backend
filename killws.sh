#!/bin/bash

for (( c=11111; c<=11131; c++ ))
do  
  fuser -n tcp -k $c
done