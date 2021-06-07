#!/bin/bash

while :
do
	if [[ `/usr/bin/netstat -tulpna | /bin/grep -iP "(listen).*(/postgres)" | /bin/wc -l` -gt 1 ]]
		then
			echo $(date +"%d-%m-%Y %T") Starting pg_bench instances
			break
	fi
	sleep 3
done

sleep 10

while :
do
	sudo -u samuil bash -c "/usr/lib/postgresql/11/bin/pgbench -c 10 -j 2 -t 1000 pg_crash_tests3" &
	sudo -u samuil bash -c "/usr/lib/postgresql/11/bin/pgbench -c 10 -j 2 -t 1000 pg_crash_tests1" & 
	sudo -u samuil bash -c "/usr/lib/postgresql/11/bin/pgbench -c 10 -j 2 -t 1000 pg_crash_tests2" 

	if [[ $? -eq 0 ]]
		then
			break
		else
			echo $(date +"%d-%m-%Y %T") cannot connect
			sleep 3
	fi
done

exit 0
