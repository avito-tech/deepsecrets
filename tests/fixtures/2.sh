#!/bin/bash

curl -u 'login01:password01' -s "https://example.com/test"
# should not be matched as a variable
curl -u 'login01:$password_var' -s "https://example.com/test"
curl -u "qauser:$password" $URL > $FILENAME