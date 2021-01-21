import slack, time
from datetime import datetime
from slack_credentials import SLACK_TOKEN
from flask import Flask, request, Response
from comments import GetCommentsToSend

app = Flask(__name__)

@app.route('/drive-comments', methods=['POST'])
def DriveComments():
    data = GetCommentsToSend()
    message = ""
    if data:
        print(data)
        for comment in data: 
            message = message + "Автор: %s\nКоментар: %s\nВреме: %s\nФайл: %s\n---------------------------------------------\n" % (comment['author'], comment['content'], comment['timestamp'], comment['webViewLink'])
    
        print(message)
        try:
            client = slack.WebClient(token=SLACK_TOKEN)
            client.chat_postMessage(channel='#test-samuil', text=message)
        except Exception as e:
            print(e)
    return Response(), 200

if __name__ == "__main__":
    app.run(debug=True, port=8000)