#!/bin/bash

result_python=`ps aux | grep -i "monitor.py" | wc -l`

if [[ $result_python -gt 1 ]] 
    then 
        exit 0
    else
        cd /media/samuil2001ivanov/808137c8-9dff-4126-82f4-006ab928a3fc1/training-projects/samuilivanov23-monitoring_DriveAPI/
        python3 monitor.py
        exit 0
fi