MAX_PARENTS = 500  # Set limit below Google max of 599 parents per query.

# Returns a dictionary of all folder IDs in the drive mapped to their parent folders 
def get_all_folders_in_drive(service):
    folders_in_drive_dict = {}
    page_token = None
    max_allowed_page_size = 1000
    just_folders = "trashed = false and mimeType = 'application/vnd.google-apps.folder'" # Get only folders not in trash

    while True:
        results = service.files().list(
            pageSize=max_allowed_page_size,
            fields="nextPageToken, files(id, name, mimeType, parents)",
            includeItemsFromAllDrives=True, supportsAllDrives=True,
            pageToken=page_token,
            q=just_folders).execute()

        folders = results.get('files', [])
        page_token = results.get('nextPageToken', None)
        for folder in folders:
            folders_in_drive_dict[folder['id']] = folder['parents'][0] # folder_id -> parrent_id
        
        #Check if there are more folders to be fetched
        if page_token is None:
            break

    return folders_in_drive_dict


def get_subfolders_of_folder(folder_to_search, all_folders):
    temp_list = [k for k, v in all_folders.items() if v == folder_to_search]  # Get all subfolders

    for sub_folder in temp_list:  # For each subfolder...
        yield sub_folder  # Return it
        yield from get_subfolders_of_folder(sub_folder, all_folders)  # Get subsubfolders etc


def get_relevant_files(relevant_folders, service):
    relevant_files = []
    chunked_relevant_folders_list = [relevant_folders[i:i + MAX_PARENTS] for i in
                                     range(0, len(relevant_folders), MAX_PARENTS)]

    for folder_list in chunked_relevant_folders_list:
        query_term = ' in parents or '.join('"{0}"'.format(f) for f in folder_list) + ' in parents'
        relevant_files += get_all_files_in_folders(query_term, service)
    return relevant_files


def get_all_files_in_folders(parent_folders, service):
    files_under_folder = []
    page_token = None
    max_allowed_page_size = 1000
    just_files = f"mimeType != 'application/vnd.google-apps.folder' and trashed = false and ({parent_folders})"

    while True:
        results = service.files().list(
            pageSize=max_allowed_page_size,
            fields="nextPageToken, files(id, name, parents, webViewLink)",
            includeItemsFromAllDrives=True, supportsAllDrives=True,
            pageToken=page_token,
            q=just_files).execute()

        files = results.get('files', [])
        page_token = results.get('nextPageToken', None)

        for file in files:
            files_under_folder.append({
                'name' : file['name'],
                'id' : file['id'],
                'webViewLink' : file['webViewLink']
            })
        
        #Check if there are more folders to be fetched
        if page_token is None:
            break
            
    return files_under_folder