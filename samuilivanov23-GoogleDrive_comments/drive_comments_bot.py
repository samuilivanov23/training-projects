from google_drive.create_google_service import CreateService
import slack, time, re
from datetime import datetime
from slack_credentials import SLACK_TOKEN
from flask import Flask, request, Response
from comments import GetCommentsToSend
from pprint import pprint
from recursive_search import *
from threading import Thread

CLIENT_SECRET_FILE = "credentials.json"
API_NAME = "drive"
API_VERSION = "v3"
SCOPES = ["https://www.googleapis.com/auth/drive"]
CHANNEL_TO_SEND = "#test-samuil"
service = CreateService(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)

app = Flask(__name__)

@app.route('/drive-comments', methods=['POST', 'GET'])
def DriveComments():
    data = request.form
    response_url = data.get('response_url')

    # Get the folder_ID based on the folder name in the slack command
    command_parameters = [data.get('text')]
    command_parameters = re.split(r',\s+', command_parameters[0])

    try:
        is_folder, file = GetFolderID(command_parameters[0])
        assignee = command_parameters[1]
        assignee_name = command_parameters[2]

        thread = Thread(target=Worker, args=(response_url, is_folder, file, command_parameters[0], assignee, assignee_name))
        thread.start()
        return Response(), 200 # passed parameters are valid and comments fetching can start
    except Exception as e:
        print(e)
        return Response(), 500 # passed data is invalid -> return 500 internal server error

def SendCommentsFromAllFiles(folder_id, root_dir, assignee, assignee_name):
    # Get all drive folders
    all_folders_dict = get_all_folders_in_drive(service)

    # Recursively search for subfolders in the given folder
    relevant_folders_list = [folder_id]  # Start with the folder-to-archive

    for folder in get_subfolders_of_folder(folder_id, all_folders_dict):
        relevant_folders_list.append(folder)
    

    # Get all files from current folder and each subfolder
    relevant_files = get_relevant_files(relevant_folders_list, service)  # Get the files
    message = "root - %s\n\n" % root_dir
    all_files_posts = []
    all_files_comments = []
    posts_count = comments_count = 0

    for file in relevant_files:
        comments_data = GetCommentsToSend(file, service, assignee, assignee_name)
        
        if comments_data['my_posts']:
            posts_count += len(comments_data['my_posts'])
            all_files_posts.append([comments_data, file['name']])
            
        if comments_data['comments']:
            comments_count += len(comments_data['comments'])
            all_files_comments.append([comments_data, file['name']])
    
    if all_files_posts:
        message += "`От %s` - %d поста, които е пуснал:\n" % (all_files_posts[0][0]['my_posts'][0]['author'].split('@')[0], posts_count)
        for file_posts, file_name in all_files_posts:
            for post in file_posts['my_posts']:
                content = post['content'].split(' ')[:5]
                content = ' '.join(content)
                elapsed_time = GetCommentElapsedTime(post['timestamp'])
                message += "%s - %s - <%s|файл> - %s...\n---------------------------------------------\n" % (file_name, elapsed_time, post['webViewLink'], content)

    message +='\n\n'
    if all_files_comments:
        message += "`От %s` - %d коментара/поста, в които `%s` е тагнат и се чака отговор от него:\n" % (all_files_comments[0][0]['comments'][0]['author'].split('@')[0], comments_count, re.split(r'@', assignee)[0])
        for file_comments, file_name in all_files_comments:
            for comment in file_comments['comments']:
                content = comment['content'].split(' ')[:5]
                content = ' '.join(content)
                elapsed_time = GetCommentElapsedTime(comment['timestamp'])
                message += "%s - %s - <%s|файл> - %s...\n---------------------------------------------\n" % (file_name, elapsed_time, comment['webViewLink'], content)

    return message

def SendCommentsFromFile(file, root_dir, assignee, assignee_name):
    comments_data = GetCommentsToSend(file, service, assignee, assignee_name)
    all_files_posts = []
    all_files_comments = []
    posts_count = comments_count = 0
    message = "root - %s\n\n" % root_dir
    
    if comments_data['my_posts']:
        posts_count += len(comments_data['my_posts'])
        all_files_posts.append(comments_data)
        
    if comments_data['comments']:
        comments_count += len(comments_data['comments'])
        all_files_comments.append(comments_data)
    
    if all_files_posts:
        message += "`От %s` - %d коментара които си пуснал:\n" % (all_files_comments[0]['my_posts'][0]['mentioned'], posts_count)
        for file_posts in all_files_posts:
            for post in file_posts['my_posts']:
                content = post['content'].split(' ')[:5]
                content = ' '.join(content)
                elapsed_time = GetCommentElapsedTime(post['timestamp'])
                message += "%s - %s - <%s|файл> - %s...\n---------------------------------------------\n" % (file['name'], elapsed_time, content)

    message +='\n\n'
    if all_files_comments:
        # pprint(all_files_comments)
        message += "`От %s` - %d коментара, в които `%s` е тагнат и се чака отговор от него:\n" % (all_files_comments[0]['comments'][0]['mentioned'], comments_count, re.split(r'@', assignee)[0])
        for file_comments in all_files_comments:
            for comment in file_comments['comments']:
                content = comment['content'].split(' ')[:5]
                content = ' '.join(content)
                elapsed_time = GetCommentElapsedTime(comment['timestamp'])
                message += "%s - %s - <%s|файл> - %s...\n---------------------------------------------\n" % (file['name'], elapsed_time, comment['webViewLink'], content)
                
    return message

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
            return None, None #If there is no such folder or file
    
def GetCommentElapsedTime(comment_timestamp):
    comment_date = datetime.strptime(comment_timestamp, "%Y-%m-%dT%H:%M:%S.%fZ")
    elapsed_time = abs(datetime.utcnow() - comment_date)
    if elapsed_time.days > 1:
        return "%d дни" % elapsed_time.days
    elif round(elapsed_time.seconds/3600) > 1:
        return "%d часa" % round(elapsed_time.seconds/3600)
    elif elapsed_time.seconds > 60:
        return "%d минути" % round(elapsed_time.seconds/60)
    else:
        return "%d секунди" % round(elapsed_time.seconds)

def Worker(response_url, is_folder, file, root_dir, assignee, assignee_name):
    if is_folder:
        message = SendCommentsFromAllFiles(file, root_dir, assignee, assignee_name) # In this case the file represents folder_id
    else:
        message = SendCommentsFromFile(file, root_dir, assignee, assignee_name) # In this case the file represents a file object
    
    print(message)

    try:
        client = slack.WebClient(token=SLACK_TOKEN)
        client.chat_postMessage(channel=CHANNEL_TO_SEND, text=message)
    except Exception as e:
        print(e)

if __name__ == "__main__":
    app.run(debug=True, port=8000)