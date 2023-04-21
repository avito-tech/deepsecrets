#!/bin/bash

LICENSE_KEY='TESTSECRET1234'

jira_final_file="jira_access_`date +'%Y-%m-%d'`.csv"
cf_final_file="cf_access_`date +'%Y-%m-%d'`.csv"
stash_final_file="stash_access_`date +'%Y-%m-%d'`.csv"

curl -u 'login01:password01' -s "https://example.com/test" | jq -r '.space.name + " (" + .space.key + "): " + .title'

# should not be matched as a variable
curl -u 'login01:$password_var' -s "https://example.com/test"


printf "\nCleaning logs remotely...\n"
ssh prx-cf "sudo rm confluence_logs_*.tar.gz"
ssh prx-stash "sudo rm bitbucket_logs_*.tar.gz"
ssh prx-jira "sudo rm jira_logs_*.tar.gz"
printf "\nDone.\n"


while IFS= read -r line
do
  task_number=`echo $line  | grep -oP '[A-Z]*\-[0-9]*'`
  count_number=`echo $line | tr -s " " | cut -d " " -f1`
  long_link=`echo $line | tr -s " " | cut -d " " -f2`
  task_summary=`curl -u 'login02:password02' -s "https://example.com/test" |  jq -r '.key + ": " + .fields.summary'`
done < accessed_jira_tasks_and_searches.txt
printf "Done.\n"

while IFS= read -r line
do
  content_id=`echo $line | cut -d "=" -f2 | cut -d "&" -f1`
  count_number=`echo $line | tr -s " " | cut -d " " -f1`
  long_link=`echo $line | tr -s " " | cut -d " " -f2`
  page_title=`curl -u 'login03:password03' -s "https://example.com/test" | jq -r '.space.name + " (" + .space.key + "): " + .title'`
  printf "%s, \"%s\", %s\n" "$count_number" "$page_title" "$long_link" >> ${cf_final_file}
done < accessed_cf_pages.txt
printf "Done.\n"
