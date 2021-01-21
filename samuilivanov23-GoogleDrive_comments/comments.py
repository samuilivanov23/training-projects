from google_drive.create_google_service import CreateService
from pprint import pprint
import re

email_regex = '[\w\.-]+@[\w\.-]+'
my_emails = ["samuil.iv@arc-global.com", "samuil.iv@hackerschool-bg.com"]

#testing email_regex
# print(re.findall(email_regex, "@samuil.iv@hackerschool-bg.com problem na 10ti red"))
# print(re.findall(email_regex, "@samuil.iv@arc-global.com problem na 15ti red"))
# print(re.findall(email_regex, "@samuil2001ivanov@gmail.com problem na 100tni red"))


CLIENT_SECRET_FILE = "credentials.json"
API_NAME = "drive"
API_VERSION = "v3"
SCOPES = ["https://www.googleapis.com/auth/drive"]
FILE_ID = "1NbcJAgaVwqUtmuZbyBHgeN6PyaWJGxH6LNHvxCyipT0"
FILE_NAME = "DriveAPI comments testing"

if __name__ == "__main__":
    data_to_send = []
    service = CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)
    results = service.files().list(
        q="name='%s'" % FILE_NAME, pageSize=10, fields='nextPageToken, files(id, name, createdTime, webViewLink)').execute()

    files = results.get('files', [])

    if not files:
        print("No files found")
    else:
        print("Files:")
        for file in files:
            print(file)

            results = service.comments().list(fileId=file['id'], fields="comments(author, content, replies, createdTime)").execute()
            comments = results.get('comments', [])

            if not comments:
                print("HEREEE!?!?!?????")
                data_to_send.append({'fileName': file['name'], 'msg' : "No comments in that file"})
            else:
                for comment in comments:
                    if comment['replies']:
                        for reply in reversed(comment['replies']):
                            print(reply['content'])
                            emails_found = re.findall(email_regex, reply['content'])

                            if emails_found and (my_emails[0] in emails_found or my_emails[1] in emails_found):
                                data_to_send.append({
                                    'author' : reply['author']['displayName'],
                                    'content' : reply['content'],
                                    'timestamp' : reply['createdTime'],
                                    'webViewLink' : file['webViewLink']
                                })
                                break
                            else:
                                print("Don't send data to Slack")
                    else:
                        print("here")
                        emails_found = re.findall(email_regex, comment['content'])

                        if (not comment['author']['displayName'] == "My name here") and emails_found and (my_emails[0] in emails_found or my_emails[1] in emails_found):
                            data_to_send.append({
                                'author' : comment['author']['displayName'],
                                'content' : comment['content'],
                                'timestamp' : comment['createdTime'],
                                'webViewLink' : file['webViewLink']
                            })
                            print("Send data to Slack")
                        else:
                            print("Don't send data to Slack")
                            

print("\n")
for data in data_to_send:
    print("author: " + data['author'])
    print("content: " + data['content'])
    print("timestamp: " + data['timestamp'])
    print("webViewLink: " + data['webViewLink'])

    print("\n---------------------------------------\n")