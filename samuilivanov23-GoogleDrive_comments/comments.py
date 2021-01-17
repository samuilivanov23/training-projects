from google_drive.create_google_service import CreateService
from pprint import pprint

CLIENT_SECRET_FILE = "credentials.json"
API_NAME = "drive"
API_VERSION = "v3"
SCOPES = ["https://www.googleapis.com/auth/drive"]
FILE_ID = "1NbcJAgaVwqUtmuZbyBHgeN6PyaWJGxH6LNHvxCyipT0"

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
            print(comment['author']['displayName'])
            print(comment['content'])
            for reply in comment['replies']:
                print(reply['author']['displayName'])
                print(reply['content'])
                print(reply['createdTime'])
            print(comment['createdTime'])
            print("\n")
