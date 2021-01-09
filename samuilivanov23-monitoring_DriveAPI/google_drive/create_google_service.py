from __future__ import print_function
import pickle
from pprint import pprint
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES):
    creds = None

    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRET_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build(API_NAME, API_VERSION, credentials=creds)
    return service

    # sheet = service.spreadsheets()
    
    # values = [
    #     ["tes1", "Testiiing"]
    # ]
    
    # body = { 'values' : values }
    # value_input_option = "USER_ENTERED"

    # for row in range(2, 5):
    #     update_range = "A" + str(row) + ":B" + str(row)
    #     result = sheet.values().update(
    #         spreadsheetId=SAMPLE_SPREADSHEET_ID,
    #         range=update_range,
    #         valueInputOption=value_input_option,
    #         body=body
    #     ).execute()

    # if result:
    #     print(result)
    # else:
    #     print("not working")

# if __name__ == '__main__':
#     CreateService()
