import slack, time
from datetime import datetime
from slack_credentials import SLACK_TOKEN
from flask import Flask, request, Response
from comments import GetCommentsToSend
from pprint import pprint
from recursive_search import *

app = Flask(__name__)

@app.route('/drive-comments', methods=['POST'])
def DriveComments():
    data = request.form
    pprint(data)
    print()
    
    # Get the folder_ID based on the folder name in the slack command
    command_parameter = data.get('text');
    folder_id = GetFolderID(command_parameter)

    # Get all drive folders
    all_folders_dict = get_all_folders_in_drive() 

    # Recursively search for subfolders in the given folder
    relevant_folders_list = [folder_id]  # Start with the folder-to-archive

    for folder in get_subfolders_of_folder(folder_id, all_folders_dict):
        print(folder)
        relevant_folders_list.append(folder)
    
    print(relevant_folders_list)

    # Get all files from current folder and each subfolder
    relevant_files_dict = get_relevant_files(relevant_folders_list)  # Get the files


    
    # message = ""
    # if data:
    #     print(data)
    #     for comment in data: 
    #         message = message + "Автор: %s\nКоментар: %s\nВреме: %s\nФайл: %s\n---------------------------------------------\n" % (comment['author'], comment['content'], comment['timestamp'], comment['webViewLink'])
    
    #     print(message)
    #     try:
    #         client = slack.WebClient(token=SLACK_TOKEN)
    #         client.chat_postMessage(channel='#test-samuil', text=message)
    #     except Exception as e:
    #         print(e)
    return Response(), 200

def GetFolderID(folder_name):
    folder_name_query = "trashed = false and mimeType = 'application/vnd.google-apps.folder' and name='%s'" % folder_name

    results = service.files().list(
        pageSize=10,
        fields="files(id)",
        includeItemsFromAllDrives=True, supportsAllDrives=True,
        q=folder_name_query).execute()

    try:
        folders = results.get('files', [])
        folder_id = folders[0]['id']
    except Exception as e:
        print(e)

    return folder_id

if __name__ == "__main__":
    app.run(debug=True, port=8000)