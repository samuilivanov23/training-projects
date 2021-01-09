from __future__ import print_function
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from timeloop import Timeloop
from datetime import timedelta
t1 = Timeloop()

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/drive']

@t1.job(interval=(timedelta(seconds=5)))
def main():
    print("Creating Backup of Test spreadsheet")
    creds = None

    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('drive', 'v3', credentials=creds)

    source_file_id = '1yswSl01QjXgNik8fNkSyaAyux6kTe1rmaOfgnIpLI6w'
    folder_ids = [
        '1Llb0MHgZfphlzOSPNka06CaGLqgYSgiL',
        '1uPGAAySqlU3joDev1raklyN1M-M0mbCP'
    ]

    BackupFile(source_file_id, folder_ids, service)

    # # Call the Drive v3 API
    # results = service.files().list(
    #     q="name contains 'Tests'",
    #     pageSize=10, 
    #     fields="nextPageToken, files(id, name)").execute()
    # items = results.get('files', [])

    # if not items:
    #     print('No files found.')
    # else:
    #     print('Files:')
    #     for item in items:
    #         print(u'{0} ({1})'.format(item['name'], item['id']))

def BackupFile(source_file_id, folder_ids, service):
    for folder_id in folder_ids:
        file_metadata = {
            'name' : 'Backup testing',
            'parents' : [folder_id],
            'description' : 'Testing google drive api v3 backup file'
        }

        service.files().copy(
            fileId=source_file_id,
            body=file_metadata
        ).execute()

if __name__ == '__main__':
    t1.start(block=True)
    #main()