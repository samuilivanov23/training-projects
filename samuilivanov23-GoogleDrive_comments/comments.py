import re

email_regex = r'[\w\.-]+@[\w\.-]+'
my_emails = ["samuil.iv@arc-global.com", "samuil.iv@hackerschool-bg.com"]

def GetCommentsToSend(file, service):
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

                    if emails_found and (my_emails[0] in emails_found or my_emails[1] in emails_found):
                        address_name = re.split('@', emails_found[0])[0]
                        
                        data_to_send['comments'].append({
                            'author' : my_emails[1] if (not comment['author']['me'] is None) else comment['author']['emailAddress'],
                            'content' : reply['content'],
                            'mentioned' : address_name,
                            'timestamp' : reply['createdTime'],
                            'webViewLink' : file['webViewLink']
                        })
                        break
            else:
                emails_found = re.findall(email_regex, comment['content'])
                
                if(comment['author']['displayName'] == 'Samuil Ivanov'): # The case when i wrote the post
                    data_to_send['my_posts'].append({
                        'author' : my_emails[1] if (not comment['author']['me'] is None) else comment['author']['emailAddress'],
                        'content' : comment['content'],
                        'mentioned' : None,
                        'timestamp' : comment['createdTime'],
                        'webViewLink' : file['webViewLink']
                    })


                if (not comment['author']['displayName'] == "My name here") and emails_found and (my_emails[0] in emails_found or my_emails[1] in emails_found):
                    address_name = re.split('@', emails_found[0])[0]
                    
                    data_to_send['comments'].append({
                        'author' : my_emails[1] if (not comment['author']['me'] is None) else comment['author']['emailAddress'],
                        'content' : comment['content'],
                        'mentioned' : address_name,
                        'timestamp' : comment['createdTime'],
                        'webViewLink' : file['webViewLink']
                    })

    return data_to_send