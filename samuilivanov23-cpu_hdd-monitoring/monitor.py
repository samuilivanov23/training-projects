import os, psycopg2
from dbconf import monitoring_dbname, monitoring_dbuser, monitoring_dbpassword
from collections import namedtuple
import time
from timeloop import Timeloop
from datetime import timedelta
import subprocess

t1 = Timeloop()
monitor_data = namedtuple('cputemp', 'name temp max critical')

@t1.job(interval=(timedelta(seconds=5)))
def InsertCpuData():
    #connect to the database
    connection = psycopg2.connect("dbname='" + monitoring_dbname + 
                                  "' user='" + monitoring_dbuser + 
                                  "' password='" + monitoring_dbpassword + "'")

    connection.autocommit = False
    cur = connection.cursor()

    print('inserting cpu data')
    cat = lambda file: open(file, 'r').read().strip()
    base = '/sys/class/hwmon/'
    hwmon = os.listdir(base)[0] # [0] gets the first directory (/hwmon4) which contains the data for the cpu core temps
    
    ret = []
    hwmon = os.path.join(base, hwmon)
    
    for i in range (1,4): # to get temp[1,2,3]_input/_max/_crit files containing the needed data
        label_dir = os.path.join(hwmon, 'temp' + str(i) + '_label')
        label = cat(os.path.join(hwmon, label_dir))
        temp = int(cat(os.path.join(hwmon, 'temp' + str(i) + '_input'))) / 1000
        max_ = int(cat(os.path.join(hwmon, 'temp' + str(i) + '_max'))) / 1000
        crit = int(cat(os.path.join(hwmon, 'temp' + str(i) + '_crit'))) / 1000
        
        ret.append(monitor_data(label, temp, max_, crit))
        
        try:
            sql = "insert into cpu_temp (label, temp, max_temp, critical_temp) values(%s, %s, %s, %s)"
            cur.execute(sql, (label, temp, max_, crit))
            connection.commit()
        except Exception as e:
            print(e)

    try:
        cur.close()
        connection.close()
    except Exception as e:
        print(e)

def ParseHddTemp(output):
    output = output.split(' ')
    name = output[1] + output[2]
    temp = float(output[3].strip('°C'))

    return name, temp


@t1.job(interval=(timedelta(seconds=2)))
def HddData():
    #connect to the database
    connection = psycopg2.connect("dbname='" + monitoring_dbname + 
                                  "' user='" + monitoring_dbuser + 
                                  "' password='" + monitoring_dbpassword + "'")

    connection.autocommit = False
    cur = connection.cursor()

    drives = ['/dev/sda', '/dev/sdb']
    print('inserting hdd data')
    for drive in drives:
        result = subprocess.run(['sudo', 'hddtemp', drive], stdout=subprocess.PIPE)
        output = result.stdout.decode('utf-8').strip('\n')
        drive_name, drive_temp = ParseHddTemp(output)
        print(drive_name, drive_temp)
        try:
            sql = "insert into hdd_temp (label, temp) values(%s, %s)"
            cur.execute(sql, (drive_name, drive_temp, ))
            connection.commit()
        except Exception as e:
            print(e)
    
    try:
        cur.close()
        connection.close()
    except Exception as e:
        print(e)

if __name__ == '__main__':
    t1.start(block=True)