#!/bin/bash

for (( c=11111; c<=111211; c++ ))
do  
  fuser -n tcp -k $c
done