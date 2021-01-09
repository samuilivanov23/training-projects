import os, psycopg2
from dbconf import monitoring_dbname, monitoring_dbuser, monitoring_dbpassword
from collections import namedtuple
import time
from timeloop import Timeloop
from datetime import timedelta
import subprocess
from google_drive.create_google_service import CreateService


CLIENT_SECRET_FILE = "credentials.json"
API_NAME = "sheets"
API_VERSION = "v4"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
SAMPLE_SPREADSHEET_ID = '1yswSl01QjXgNik8fNkSyaAyux6kTe1rmaOfgnIpLI6w'

t1 = Timeloop()
monitor_data = namedtuple('cputemp', 'name temp max critical')

@t1.job(interval=(timedelta(seconds=15)))
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
            InsertCpuIntoSpreadsheet(label, temp, max_, crit)
        except Exception as e:
            print(e)

    try:
        cur.close()
        connection.close()
    except Exception as e:
        print(e)

@t1.job(interval=(timedelta(seconds=10)))
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
            InsertHddIntoSpreadsheet(drive_name, drive_temp)
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

def InsertCpuIntoSpreadsheet(label, temp, max_, crit):
    values = [
        [label, temp, max_, crit]
    ]
    
    body = { 'values' : values }
    value_input_option = "USER_ENTERED"
    insert_data_option = "INSERT_ROWS"

    update_range = "Sheet1!A2:D2"
    result = sheet.values().append(
        spreadsheetId=SAMPLE_SPREADSHEET_ID,
        range=update_range,
        valueInputOption=value_input_option,
        insertDataOption=insert_data_option,
        body=body
    ).execute()

    if result:
        print(result)
    else:
        print("cpu insertion not working")

def InsertHddIntoSpreadsheet(drive_name, drive_temp):
    values = [
        [drive_name, drive_temp]
    ]
    
    body = { 'values' : values }
    value_input_option = "USER_ENTERED"
    insert_data_option = "INSERT_ROWS"

    update_range = "Sheet2!A2:B2"
    result = sheet.values().append(
        spreadsheetId=SAMPLE_SPREADSHEET_ID,
        range=update_range,
        valueInputOption=value_input_option,
        insertDataOption=insert_data_option,
        body=body
    ).execute()

    if result:
        print(result)
    else:
        print("hdd insertion not working")

if __name__ == '__main__':
    while True:
        try:
            service = CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
            sheet = service.spreadsheets()
            t1.start(block=True)
        except Exception as e:
            print("Unable authenticate with sheet api and create service")
            print(e)