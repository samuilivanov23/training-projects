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

def CallDatabaseInsertionFunction(args):
    InsertDataIntoDb('cpu', args[0])
    InsertDataIntoDb('hdd', args[1])
    InsertDataIntoDb('ssd', args[2])   
    InsertDataIntoDb('memory', args[3])

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

def CallSpreadSheetInsertionFunction(args):
    InsertDataIntoSpreadsheet("cpu!A2:D2", args[0])
    InsertDataIntoSpreadsheet("hdd!A2:D2", args[1])
    InsertDataIntoSpreadsheet("ssd!A2:D2", args[2])
    InsertDataIntoSpreadsheet("memory!A2:E2", args[3])

def InsertDataIntoSpreadsheet(update_range, args):
    try:
        SendToSpreadSheet(update_range, args)
    except Exception as e:
        print(e)

def SendToSpreadSheet(update_range, args):
    values = [
        args
    ]
    
    body = { 'values' : values }
    value_input_option = "USER_ENTERED"
    insert_data_option = "INSERT_ROWS"

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
        print("insertion not working")

def SendDataToSlack(content):
    payload = '{"text" : "%s"}' % content 
    response = requests.post('https://hooks.slack.com/services/' + slack_webhook_token,
                            data=payload, timeout=2.5)
if __name__ == '__main__':
    buffer = []
    while True:
        # Post data to Slack test-samuil channel
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
        
        slack_buffer = []

        try:
            if slack_buffer:
                for slack_row in slack_buffer:
                    SendDataToSlack(slack_row)
                slack_buffer = []
                SendDataToSlack(content)
            else:
                SendDataToSlack(content)
        except Exception as e:
            slack_buffer.append(content)
            print(e)
                
        #Insert data into Database
        row = [
            [timestamp_cpu_disks, cpu_info['user'], cpu_info['system'], cpu_info['iowait']],
            [timestamp_cpu_disks, 'ST1000LM024 HN-M101MBB', hdd_info['read_ps'], hdd_info['wrtn_ps']],
            [timestamp_cpu_disks, 'ADATA SU800', ssd_info['read_ps'], ssd_info['wrtn_ps']],
            [timestamp_memory, memory_info['used'], memory_info['active'], memory_info['inactive'], memory_info['free']]
        ]

        CallDatabaseInsertionFunction(row)
        
        #Post data to Google SpreadSheet
        try:
            service = CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
            sheet = service.spreadsheets()
            connection_successfull = True
        except Exception as e:
            print('adding to buffer')
            buffer.append(row)
            print("Unable authenticate with sheet api and create service")
            print(e)
            connection_successfull = False
    
        if connection_successfull:
            try:
                if buffer:
                    for row_buffer in buffer:
                        CallSpreadSheetInsertionFunction(row_buffer)

                    CallSpreadSheetInsertionFunction(row)
                    buffer = []
                else:
                    CallSpreadSheetInsertionFunction(row)
            except Exception as e:
                print(e)
        time.sleep(3600)