from google_drive.create_google_service import CreateService
from pprint import pprint
import re

email_regex = '[\w\.-]+@[\w\.-]+'
my_emails = ["samuil.iv@arc-global.com", "samuil.iv@hackerschool-bg.com"]

#testing email_regex
# print(re.match(email_regex, "samuil.iv@hackerschool-bg.com"))
# print(re.match(email_regex, "samuil.iv@arc-global.com"))
# print(re.match(email_regex, "samuil2001ivanov@gmail.com"))


CLIENT_SECRET_FILE = "credentials.json"
API_NAME = "drive"
API_VERSION = "v3"
SCOPES = ["https://www.googleapis.com/auth/drive"]
FILE_ID = "1NbcJAgaVwqUtmuZbyBHgeN6PyaWJGxH6LNHvxCyipT0"
#FILE_ID = "1WPS3EYEYkQpMJ9mDCiZoKw6uU5CYTDLMQvAQhbbSkAU"

if __name__ == "__main__":
    service = CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)

    results = service.files().list(
        pageSize=10, fields='nextPageToken, files(id, name, createdTime, webViewLink)').execute()

    files = results.get('files', [])

    if not files:
        print("No files found")
    else:
        print("Files:")
        for file in files:
            print(file)

    print("\n\n")

    results = service.comments().list(fileId=FILE_ID, fields="comments(author, content, replies, createdTime)").execute()
    comments = results.get('comments', [])

    if not comments:
        print("No comments found")
    else:
        print("Comments:")
        for comment in comments:
            print('NEW POST')
            print(comment['author']['displayName'])
            print(comment['content'])
            
            if comment['replies']:
                #TODO check the last reply I'm tagged in
                for reply in reversed(comment['replies']):
                    #TODO check if I'm tagged and break if that's the case
                    print(reply['author']['displayName'])
                    print(reply['content'])
                    print("----------------------------------------------------------------------")

                    try:
                        emails_found = re.findall(email_regex, reply['content'])
                        if emails_found:
                            print(emails_found)
                            if (my_emails[0] in emails_found or my_emails[1] in emails_found):
                                print("Send data to Slack")
                            else:
                                print("Don't send data to Slack")
                            break
                        else:
                            print("Not tagged in reply")
                    except Exception as e:
                        print(e)
                        
                print("\n\n")
            else:
                #TODO check if I'm tagged in the thost
                print("No replies to this post")