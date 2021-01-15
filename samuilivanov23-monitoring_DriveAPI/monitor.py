import os, psycopg2, subprocess, time
from conf import monitoring_dbname, monitoring_dbuser, monitoring_dbpassword, slack_webhook_token
from collections import namedtuple
from timeloop import Timeloop
from datetime import datetime, timedelta
from google_drive.create_google_service import CreateService
import requests

CLIENT_SECRET_FILE = "credentials.json"
API_NAME = "sheets"
API_VERSION = "v4"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
SAMPLE_SPREADSHEET_ID = '1yswSl01QjXgNik8fNkSyaAyux6kTe1rmaOfgnIpLI6w'

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

def GetCpuAndDiskData():
    timestamp = str(datetime.now().replace(second=0, microsecond=0))
    result = subprocess.run(['iostat', '-p', 'sda', 'sdb'], stdout=subprocess.PIPE, shell=False, stderr=subprocess.PIPE)
    stdout = result.stdout.decode('utf-8').strip('\n').split('\n')

    cpu_load = stdout[3].strip(' ').replace('   ', ' ').split(' ')
    cpu_info = {
        'user' : cpu_load[0],
        'system' : cpu_load[4],
        'iowait' : cpu_load[6]
    }

    hdd_load = stdout[6].split('        ')
    ssd_load = stdout[7].split('       ')
    
    hdd_info = {
        'read_ps' : hdd_load[2].strip(' '),
        'wrtn_ps' : hdd_load[3].strip(' '),
    }
    ssd_info = {
        'read_ps' : ssd_load[3].strip(' '),
        'wrtn_ps' : ssd_load[4].strip(' '),
    }
    
    return timestamp, cpu_info, hdd_info, ssd_info

def GetMemoryData():
    timestamp = str(datetime.now().replace(second=0, microsecond=0))
    result = subprocess.run(['vmstat', '-s'], stdout=subprocess.PIPE, shell=False, stderr=subprocess.PIPE)
    stdout = result.stdout.decode('utf-8').split('\n')

    memory_info = {
        'used' : round(float(int(stdout[1].strip(' ').split(' ')[0]) / 1000000), 2),
        'active' : round(float(stdout[2].strip(' ').split(' ')[0]) / 1000000, 2),
        'inactive' : round(float(stdout[3].strip(' ').split(' ')[0]) / 1000000, 2),
        'free' : round(float(stdout[4].strip(' ').split(' ')[0]) / 1000000, 2),
    }
    
    return timestamp, memory_info

def InsertDataIntoDb(table_name, args):
    try:
        cur, connection = ConnectToDatabase()
        try:
            if table_name == 'cpu':
                sql = "insert into " + table_name + " (measured_at, user_load, system, iowait) values(%s, %s, %s, %s)"
                cur.execute(sql, (args[0], args[1], args[2], args[3]))
            elif table_name == 'memory':
                sql = "insert into " + table_name + " (measured_at, used_gb, active_gb, inactive_gb, free_gb) values(%s, %s, %s, %s, %s)"
                cur.execute(sql, (args[0], args[1], args[2], args[3], args[4]))                
            else:
                sql = "insert into " + table_name + " (measured_at, label, read_ps, wrtn_ps) values(%s, %s, %s, %s)"
                cur.execute(sql, (args[0], args[1], args[2], args[3]))
            connection.commit()
        except Exception as e:
            print(e)

    except Exception as e:
        try:
            CloseDbConnection(cur, connection)
        except Exception as e:
            print('Unable to connect ot Database')
            print(e)

def InsertDataIntoSpreadsheet(sheet_name, args):
    try:
        if sheet_name == 'cpu':
            InsertIntoCpuSpreadSheet(sheet_name, args[0], args[1], args[2], args[3])
        elif sheet_name == 'memory':
            InsertIntoMemorySpreadSheets(sheet_name, args[0], args[1], args[2], args[3], args[4])
        else:
            InsertIntoHardDriveSpreadSheets(sheet_name, args[0], args[1], args[2], args[3])
    except Exception as e:
        print(e)

def InsertIntoCpuSpreadSheet(sheet_name, timestamp, user_load, system_load, iowait):
    values = [
        [timestamp, user_load, system_load, iowait]
    ]
    
    body = { 'values' : values }
    value_input_option = "USER_ENTERED"
    insert_data_option = "INSERT_ROWS"

    update_range = "%s!A2:D2" % sheet_name
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

def InsertIntoHardDriveSpreadSheets(sheet_name, timestamp, drive_name, read_ps, wrtn_ps):
    values = [
        [timestamp, drive_name, read_ps, wrtn_ps]
    ]
    
    body = { 'values' : values }
    value_input_option = "USER_ENTERED"
    insert_data_option = "INSERT_ROWS"

    update_range = "%s!A2:D2" % sheet_name
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

def InsertIntoMemorySpreadSheets(sheet_name, timestamp, used, active, inactive, free):
    values = [
        [timestamp, used, active, inactive, free]
    ]
    
    body = { 'values' : values }
    value_input_option = "USER_ENTERED"
    insert_data_option = "INSERT_ROWS"

    update_range = "%s!A2:E2" % sheet_name
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

def SendDataToSlack(content):
    payload = '{"text" : "%s"}' % content 
    response = requests.post('https://hooks.slack.com/services/' + slack_webhook_token,
                            data=payload)
if __name__ == '__main__':
    timestamp_cpu_disks, cpu_info, hdd_info, ssd_info = GetCpuAndDiskData()
    timestamp_memory,  memory_info = GetMemoryData()

    user = cpu_info['user']
    sys = cpu_info['system']
    iowait = cpu_info['iowait']
    hdd_label = "ST1000LM024 HN-M101MBB"
    hdd_read_ps = hdd_info['read_ps']
    hdd_wrtn_ps = hdd_info['wrtn_ps']
    ssd_label = "ADATA SU800"
    ssd_read_ps = ssd_info['read_ps']
    ssd_wrtn_ps = ssd_info['wrtn_ps']
    used = memory_info['used']
    active = memory_info['active']
    inactive = memory_info['inactive']
    free = memory_info['free']
    
    file = open("./slack_message_template.txt", "r")
    content = f"{file.read()}".format(**locals())
    file.close()
    
    print(content)
    SendDataToSlack(content)



    # buffer = []
    # while True:
    #     print('test')
    #     time.sleep(10)
        # timestamp_cpu_disks, cpu_info, hdd_info, ssd_info = GetCpuAndDiskData()
        # timestamp_memory,  memory_info = GetMemoryData()

        # #SendDataToSlack(timestamp_cpu_disks, timestamp_memory, cpu_info, hdd_info, ssd_info, memory_info)

        # InsertDataIntoDb('cpu', [timestamp_cpu_disks, cpu_info['user'], cpu_info['system'], cpu_info['iowait']])
        # InsertDataIntoDb('hdd', [timestamp_cpu_disks, 'ST1000LM024 HN-M101MBB', hdd_info['read_ps'], hdd_info['wrtn_ps']])
        # InsertDataIntoDb('ssd', [timestamp_cpu_disks, 'ADATA SU800', ssd_info['read_ps'], ssd_info['wrtn_ps']])
        # InsertDataIntoDb('memory', [timestamp_memory, memory_info['used'], memory_info['active'], memory_info['inactive'], memory_info['free']])

        # try:
        #     service = CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
        #     sheet = service.spreadsheets()
        #     connection_successfull = True
        # except Exception as e:
        #     print('adding to buffer')
        #     buffer.append([
        #         [timestamp_cpu_disks, cpu_info['user'], cpu_info['system'], cpu_info['iowait']], 
        #         [timestamp_cpu_disks, 'ST1000LM024 HN-M101MBB', hdd_info['read_ps'], hdd_info['wrtn_ps']], 
        #         [timestamp_cpu_disks, 'ADATA SU800', ssd_info['read_ps'], ssd_info['wrtn_ps']],
        #         [timestamp_memory, memory_info['used'], memory_info['active'], memory_info['inactive'], memory_info['free']]
        #     ])
        #     print("Unable authenticate with sheet api and create service")
        #     print(e)
        #     connection_successfull = False
    
        # if connection_successfull:
        #     sheet_threads = []
        #     try:
        #         if buffer:
        #             for row in buffer:
        #                 InsertDataIntoSpreadsheet('cpu', row[0]) #cpu
        #                 InsertDataIntoSpreadsheet('hdd', row[1]) #hdd
        #                 InsertDataIntoSpreadsheet('ssd', row[2]) #ssd
        #                 InsertDataIntoSpreadsheet('memory', row[3]) #memory
        #             InsertDataIntoSpreadsheet('cpu', [timestamp_cpu_disks, cpu_info['user'], cpu_info['system'], cpu_info['iowait']])
        #             InsertDataIntoSpreadsheet('hdd', [timestamp_cpu_disks, 'ST1000LM024 HN-M101MBB', hdd_info['read_ps'], hdd_info['wrtn_ps']])
        #             InsertDataIntoSpreadsheet('ssd', [timestamp_cpu_disks, 'ADATA SU800', ssd_info['read_ps'], ssd_info['wrtn_ps']])
        #             InsertDataIntoSpreadsheet('memory', [timestamp_memory, memory_info['used'], memory_info['active'], memory_info['inactive'], memory_info['free']])
        #             buffer = []
        #         else:
        #             InsertDataIntoSpreadsheet('cpu', [timestamp_cpu_disks, cpu_info['user'], cpu_info['system'], cpu_info['iowait']])
        #             InsertDataIntoSpreadsheet('hdd', [timestamp_cpu_disks, 'ST1000LM024 HN-M101MBB', hdd_info['read_ps'], hdd_info['wrtn_ps']])
        #             InsertDataIntoSpreadsheet('ssd', [timestamp_cpu_disks, 'ADATA SU800', ssd_info['read_ps'], ssd_info['wrtn_ps']])
        #             InsertDataIntoSpreadsheet('memory', [timestamp_memory, memory_info['used'], memory_info['active'], memory_info['inactive'], memory_info['free']])
        #     except Exception as e:
        #         print("Unable to authenticate with sheet api and create service")
        #         print(e) 
        # time.sleep(10)