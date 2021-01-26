from google_drive.create_google_service import CreateService
import slack, time
from datetime import datetime
from slack_credentials import SLACK_TOKEN
from flask import Flask, request, Response
from comments import GetCommentsToSend
from pprint import pprint
from recursive_search import *

CLIENT_SECRET_FILE = "credentials.json"
API_NAME = "drive"
API_VERSION = "v3"
SCOPES = ["https://www.googleapis.com/auth/drive"]
service = CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)

app = Flask(__name__)

@app.route('/drive-comments', methods=['POST'])
def DriveComments():
    data = request.form

    # Get the folder_ID based on the folder name in the slack command
    command_parameter = data.get('text');
    print(command_parameter)
    is_folder, file = GetFolderID(command_parameter)

    if is_folder:
        SendCommentsFromAllFiles(file) # In this case the file represents folder_id
    else:
        SendCommentsFromFile(file) # In this case the file represents a file object
    return Response(), 200

def SendCommentsFromAllFiles(folder_id):
    # Get all drive folders
    all_folders_dict = get_all_folders_in_drive(service)

    # Recursively search for subfolders in the given folder
    relevant_folders_list = [folder_id]  # Start with the folder-to-archive

    for folder in get_subfolders_of_folder(folder_id, all_folders_dict):
        relevant_folders_list.append(folder)
    

    # Get all files from current folder and each subfolder
    relevant_files = get_relevant_files(relevant_folders_list, service)  # Get the files
    message = ""
    all_files_posts = []
    all_files_comments = []
    posts_count = comments_count = 0

    for file in relevant_files:
        comments_data = GetCommentsToSend(file, service)
        
        if comments_data['my_posts']:
            posts_count += len(comments_data['my_posts'])
            all_files_posts.append([comments_data, file['name']])
            
        if comments_data['comments']:
            comments_count += len(comments_data['comments'])
            all_files_comments.append([comments_data, file['name']])
    
    if all_files_posts:
        message += "%s - %d коментара които си пуснал:\n" % (all_files_comments[0][0]['my_posts'][0]['author'].split('@')[0], posts_count)
        for file_posts, file_name in all_files_posts:
            for post in file_posts['my_posts']:
                content = post['content'].split(' ')[:5]
                content = ' '.join(content)
                message += "%s - %s - <%s|файл> - %s...\n---------------------------------------------\n" % (file_name, post['timestamp'], post['webViewLink'], content)

    message +='\n\n'
    if all_files_comments:
        message += "%s - %d коментара, в които си тагнат и се чака отговор от теб:\n" % (all_files_comments[0][0]['comments'][0]['author'].split('@')[0], comments_count)
        for file_comments, file_name in all_files_comments:
            for comment in file_comments['comments']:
                content = comment['content'].split(' ')[:5]
                content = ' '.join(content)
                message += "%s - %s - <%s|файл> - %s...\n---------------------------------------------\n" % (file_name, comment['timestamp'], comment['webViewLink'], content)
                
    print(message)
    #SendToSlack(message)

def SendCommentsFromFile(file):
    comments_data = GetCommentsToSend(file, service)
    all_files_posts = []
    all_files_comments = []
    posts_count = comments_count = 0
    message = ""
    
    if comments_data['my_posts']:
        posts_count += len(comments_data['my_posts'])
        all_files_posts.append(comments_data)
        
    if comments_data['comments']:
        comments_count += len(comments_data['comments'])
        all_files_comments.append(comments_data)
    
    if all_files_posts:
        message += "%s - %d коментара които си пуснал:\n" % (all_files_comments[0]['my_posts'][0]['mentioned'], posts_count)
        for file_posts in all_files_posts:
            for post in file_posts['my_posts']:
                content = post['content'].split(' ')[:5]
                content = ' '.join(content)
                message += "%s - %s - <%s|файл> - %s...\n---------------------------------------------\n" % (file['name'], post['timestamp'], content)

    message +='\n\n'
    if all_files_comments:
        pprint(all_files_comments)
        message += "%s - %d коментара, в които си тагнат и се чака отговор от теб:\n" % (all_files_comments[0]['comments'][0]['mentioned'], comments_count)
        for file_comments in all_files_comments:
            for comment in file_comments['comments']:
                content = comment['content'].split(' ')[:5]
                content = ' '.join(content)
                message += "%s - %s - <%s|файл> - %s...\n---------------------------------------------\n" % (file['name'], comment['timestamp'], comment['webViewLink'], content)
                
    print(message)
    #SendToSlack(message)

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
        is_folder = True
        return is_folder, folder_id
    except Exception as e:
        print(e)
        folder_name_query = "trashed = false and name='%s'" % folder_name

        results = service.files().list(
            pageSize=10,
            fields="files(id, name, webViewLink)",
            includeItemsFromAllDrives=True, supportsAllDrives=True,
            q=folder_name_query).execute()
        
        try:
            file = results.get('files', [])
            is_folder = False
            return is_folder, file[0]
        except Exception as e:
            print(e)
            return None, None

def SendToSlack(message):
    try:
        client = slack.WebClient(token=SLACK_TOKEN)
        client.chat_postMessage(channel='#test-samuil', text=message)
    except Exception as e:
        print(e)

if __name__ == "__main__":
    app.run(debug=True, port=8000)