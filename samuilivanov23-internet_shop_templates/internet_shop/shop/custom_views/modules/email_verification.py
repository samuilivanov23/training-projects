import uuid, smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import traceback
from . import database_operations

class Verifier:
    def __init__(self):
        pass
    
    def SendEmail(self, user_id, 
                        first_name, 
                        receiver_email, 
                        cur,
                        connection,
                        sender_email, 
                        sender_password, 
                        server_email, 
                        server_port):

        message = MIMEMultipart()
        message['Subject'] = 'Verification mail'
        message['From'] = sender_email
        message['To'] = receiver_email

        token = str(uuid.uuid4())
        dbOperator = database_operations.DbOperations()
        dbOperator.AddTokenToVerification(user_id, token, cur, connection)

        email_content = """\
        <html>
            <body>
                <p>Hi, """ + first_name + """. <br>
                If you registered in our shop with this email<br>
                <a href="http://127.0.0.1:8000/shop/register/""" + token + """">Please click here to verify.</a>
                </p>
            </body>
        </html>
        """

        try:
            message.attach(MIMEText(email_content, 'html'))
        except:
            print(traceback.format_exc())

        try:
            #Create secure connection with the server and send the email
            context = ssl.create_default_context()
        except:
            print(traceback.format_exc())

        try:
            with smtplib.SMTP_SSL(server_email, server_port, context=context) as server:
                server.login(sender_email, sender_password)
                server.sendmail(
                    sender_email, receiver_email, message.as_string()
                )

            return 1, token
        except:
            print(traceback.format_exc())
            return 0, token