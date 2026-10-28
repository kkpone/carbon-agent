#!/usr/bin/env bash

ENV=.env.$1

echo 'node env is:' $REACT_APP_ENV

echo "use env : $ENV"
echo "exec path is: "
pwd

echo 'target file is: ' ".env.$REACT_APP_ENV.local"

echo "remove local env"
rm -f ./.env.development.local
rm -f ./.env.production.local

echo "generate local env"
cp $ENV ".env.$REACT_APP_ENV.local"
