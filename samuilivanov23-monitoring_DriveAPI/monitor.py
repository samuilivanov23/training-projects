import os, psycopg2, subprocess, time
from dbconf import monitoring_dbname, monitoring_dbuser, monitoring_dbpassword
from collections import namedtuple
from timeloop import Timeloop
from datetime import datetime, timedelta
from google_drive.create_google_service import CreateService

CLIENT_SECRET_FILE = "credentials.json"
API_NAME = "sheets"
API_VERSION = "v4"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
SAMPLE_SPREADSHEET_ID = '1yswSl01QjXgNik8fNkSyaAyux6kTe1rmaOfgnIpLI6w'

t1 = Timeloop()
monitor_data = namedtuple('cputemp', 'name temp max critical')

def ConnectToDatabase():
    connection = psycopg2.connect("dbname='" + monitoring_dbname + 
                                "' user='" + monitoring_dbuser + 
                                "' password='" + monitoring_dbpassword + "'")
    connection.autocommit = False
    cur = connection.cursor()
    return cur, connection

def CloseDbConnection(cur, connection):
    cur.close()
    connection.close()

def GetCputMonitorDir():
    hwmon_base = '/sys/devices/platform/coretemp.0/hwmon'
    hwmon_dir = os.listdir(hwmon_base)[0]
    cpu_monitor_dir = os.path.join(hwmon_base, hwmon_dir)
    return cpu_monitor_dir

def GetCpuData():
    cpu_monitor_dir = GetCputMonitorDir()
    cat = lambda file: open(file, 'r').read().strip()
    temperature = int(cat(os.path.join(cpu_monitor_dir, 'temp1_input'))) / 1000
    return temperature, str(datetime.now())

def GetDriveData(drive_path):
    result = subprocess.run(['sudo', 'hddtemp', drive_path], stdout=subprocess.PIPE)
    output = result.stdout.decode('utf-8').strip('\n')
    drive_name, drive_temperature = ParseHddTemp(output)
    return drive_name, drive_temperature, str(datetime.now())

def ParseHddTemp(output):
    output = output.split(' ')
    name = output[1] + output[2]
    temp = float(output[3].strip('°C'))
    return name, temp

def InsertDataIntoDb(table_name, args):
    try:
        cur, connection = ConnectToDatabase()
        try:
            if table_name == 'cpu_temp':
                sql = "insert into " + table_name + " (measured_at, temperature) values(%s, %s)"
                cur.execute(sql, (args[1], args[0]))
            else:
                sql = "insert into " + table_name + " (measured_at, label, temperature) values(%s, %s, %s)"
                cur.execute(sql, (args[2], args[0], args[1]))
            connection.commit()
        except Exception as e:
            print(e)

    except Exception as e:
        try:
            CloseDbConnection(cur, connection)
        except Exception as e:
            print('Unable to connect ot Database')
            print(e)

def InsertDataIntoSpreadsheet(sheet_number, args):
    try:
        if sheet_number == 1: ## The first sheet is for the CPU data
            InsertIntoCpuSpreadSheet(sheet_number, args[0], args[1])
        else:
            InsertIntoHardDriveSpreadSheets(sheet_number, args[0], args[1], args[2])
    except Exception as e:
        print(e)

def InsertIntoCpuSpreadSheet(sheet_number, temperature, date):
    values = [
        [date, temperature]
    ]
    
    body = { 'values' : values }
    value_input_option = "USER_ENTERED"
    insert_data_option = "INSERT_ROWS"

    update_range = "Sheet%s!A2:B2" % str(sheet_number)
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

def InsertIntoHardDriveSpreadSheets(sheet_number, drive_name, drive_temperature, date):
    values = [
        [date, drive_name, drive_temperature]
    ]
    
    body = { 'values' : values }
    value_input_option = "USER_ENTERED"
    insert_data_option = "INSERT_ROWS"

    update_range = "Sheet%s!A2:C2" % str(sheet_number)
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
        print("hard drive insertion not working")

if __name__ == '__main__':
    buffer = []
    for i in range(100):
        temperature, cpu_measured_at = GetCpuData()
        hdd_name, hdd_temperature, hdd_measured_at = GetDriveData('/dev/sda')
        ssd_name, ssd_temperature, ssd_measured_at = GetDriveData('/dev/sdb')

        InsertDataIntoDb('cpu_temp', [temperature, cpu_measured_at])
        InsertDataIntoDb('hdd_temp', [hdd_name, hdd_temperature, hdd_measured_at])
        InsertDataIntoDb('ssd_temp', [ssd_name, ssd_temperature, ssd_measured_at])

        try:
            service = CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
            sheet = service.spreadsheets()
            connection_successfull = True
        except Exception as e:
            print('adding to buffer')
            buffer.append([
                [temperature, cpu_measured_at], 
                [hdd_name, hdd_temperature, hdd_measured_at], 
                [ssd_name, ssd_temperature, ssd_measured_at]
            ])
            print("Unable authenticate with sheet api and create service")
            print(e)
            connection_successfull = False
    
        if connection_successfull:
            sheet_threads = []
            try:
                if buffer:
                    for row in buffer:
                        InsertDataIntoSpreadsheet(1, row[0])
                        InsertDataIntoSpreadsheet(2, row[1])
                        InsertDataIntoSpreadsheet(3, row[2])
                    InsertDataIntoSpreadsheet(1, [temperature, cpu_measured_at])
                    InsertDataIntoSpreadsheet(2, [hdd_name, hdd_temperature, hdd_measured_at])
                    InsertDataIntoSpreadsheet(3, [ssd_name, ssd_temperature, ssd_measured_at])
                    buffer = []
                else:
                    InsertDataIntoSpreadsheet(1, [temperature, cpu_measured_at])
                    InsertDataIntoSpreadsheet(2, [hdd_name, hdd_temperature, hdd_measured_at])
                    InsertDataIntoSpreadsheet(3, [ssd_name, ssd_temperature, ssd_measured_at])
            except Exception as e:
                print("Unable to authenticate with sheet api and create service")
                print(e) 
        time.sleep(10)