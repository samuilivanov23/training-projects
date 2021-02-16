import re

email_regex = r'[\w\.-]+@[\w\.-]+'
my_emails = ["samuil.iv@arc-global.com", "samuil.iv@hackerschool-bg.com"]

def GetCommentsToSend(file, service, assignee, assignee_name):
    data_to_send = {}
    results = service.comments().list(fileId=file['id'], fields="comments(author, content, replies, createdTime)").execute()
    comments = results.get('comments', [])

    if not comments:
        data_to_send = {'fileName': file['name'], 'msg' : "No comments in that file", 'comments' : [], 'my_posts' : []}
    else:
        data_to_send = {'fileName': file['name'], 'msg' : "Found comments in file", 'comments' : [], 'my_posts' : []}

        for comment in comments:
            if comment['replies']:
                for reply in reversed(comment['replies']):
                    emails_found = re.findall(email_regex, reply['content'])

                    if emails_found and assignee in emails_found:
                        address_name = re.split('@', assignee)[0]
                        
                        data_to_send['comments'].append({
                            'author' : comment['author']['displayName'],
                            'content' : reply['content'],
                            'mentioned' : address_name,
                            'timestamp' : reply['createdTime'],
                            'webViewLink' : file['webViewLink']
                        })
                        break
            else: # The case when there are no replies in the post
                emails_found = re.findall(email_regex, comment['content'])
                
                if comment['author']['displayName'] == assignee_name: # The case when i wrote the post
                    emails_found = re.findall(email_regex, comment['content'])
                    
                    if emails_found:
                        address_name = emails_found[0]
                    else:
                        address_name = None
                        
                    data_to_send['my_posts'].append({
                        'author' : comment['author']['displayName'],
                        'content' : comment['content'],
                        'mentioned' : address_name,
                        'timestamp' : comment['createdTime'],
                        'webViewLink' : file['webViewLink']
                    })

                if (not comment['author']['displayName'] == assignee_name) and emails_found and assignee in emails_found:
                    address_name = re.split('@', assignee)[0]                    
                    data_to_send['comments'].append({
                        'author' : comment['author']['displayName'],
                        'content' : comment['content'],
                        'mentioned' : address_name,
                        'timestamp' : comment['createdTime'],
                        'webViewLink' : file['webViewLink']
                    })

    return data_to_send