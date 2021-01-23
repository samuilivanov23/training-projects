from google_drive.create_google_service import CreateService
from pprint import pprint
import re

email_regex = r'[\w\.-]+@[\w\.-]+'
my_emails = ["samuil.iv@arc-global.com", "samuil.iv@hackerschool-bg.com"]

CLIENT_SECRET_FILE = "credentials.json"
API_NAME = "drive"
API_VERSION = "v3"
SCOPES = ["https://www.googleapis.com/auth/drive"]
FILE_ID = "1NbcJAgaVwqUtmuZbyBHgeN6PyaWJGxH6LNHvxCyipT0"
FILE_NAME = "DriveAPI comments testing"

def GetCommentsToSend():
    data_to_send = []
    service = CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
    results = service.files().list(
        q="name='%s'" % FILE_NAME, pageSize=10, fields='nextPageToken, files(id, name, createdTime, webViewLink)').execute()

    files = results.get('files', [])

    if not files:
        print("No files found")
    else:
        for file in files:
            results = service.comments().list(fileId=file['id'], fields="comments(author, content, replies, createdTime)").execute()
            comments = results.get('comments', [])

            if not comments:
                data_to_send.append({'fileName': file['name'], 'msg' : "No comments in that file"})
            else:
                for comment in comments:
                    if comment['replies']:
                        for reply in reversed(comment['replies']):
                            emails_found = re.findall(email_regex, reply['content'])

                            if emails_found and (my_emails[0] in emails_found or my_emails[1] in emails_found):
                                address_name = re.split('@', emails_found[0])[0]
                                
                                data_to_send.append({
                                    'author' : reply['author']['displayName'],
                                    'content' : reply['content'],
                                    'mentioned' : address_name,
                                    'timestamp' : reply['createdTime'],
                                    'webViewLink' : file['webViewLink']
                                })
                                break
                            else:
                                print("Don't send data to Slack")
                    else:
                        emails_found = re.findall(email_regex, comment['content'])

                        if (not comment['author']['displayName'] == "My name here") and emails_found and (my_emails[0] in emails_found or my_emails[1] in emails_found):
                            address_name = re.split('@', emails_found[0])[0]
                            
                            data_to_send.append({
                                'author' : comment['author']['displayName'],
                                'content' : comment['content'],
                                'mentioned' : address_name,
                                'timestamp' : comment['createdTime'],
                                'webViewLink' : file['webViewLink']
                            })
                        else:
                            print("Don't send data to Slack")    
    
    return data_to_send