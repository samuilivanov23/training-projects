import socket
import os
from email.parser import BytesParser
import urllib.parse


# '' for the host to accept connections on all available interfaces
SERVER_SOCKET = (HOST, PORT) = ('', 1024) #non-privileged ports are > 1023

# The number of unaccepted connections before the servers starts refusing new incoming conenctions 
UNACCEPTED_CONNECTIONS_QUEUE = 1024

# AF_INTET -> address family for IPv4
# SOCK_STREAM -> socket type for TCP connections
my_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# SOS_SOCKET -> to manipulate options at the socket API level
# SO_REUSEADDR -> to reuse a local socket in TIME_WAIT state 
my_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

my_socket.bind(SERVER_SOCKET)
my_socket.listen(UNACCEPTED_CONNECTIONS_QUEUE)


# read from file 2 bytes at once and so on.. until there is no content left
def readChunksData(file):
    while True:
        data = file.read(65536) # 16 bits <=> 2 bytes
        if not data:
            break

        yield data


def sendFile(file_path, connection):
    connection.send(b'HTTP/1.0 200 OK\n')
    connection.send(b'Content-Type: text/html\n')
    connection.send(b'\n')

    file = open(file_path, "rb")

    for chunkData in readChunksData(file):
        connection.send(chunkData)
    
    file.close()
    connection.close()

def parseSocket(socket_string):
    address, port = socket_string.split(':')
    return (address, port)

def parseEndPoint(request_first_line):
    if b'GET' in request_first_line:
        return request_first_line[3:(len(request_first_line) - 8)].strip()
    elif b'POST' in request_first_line:
        return request_first_line[4:(len(request_first_line) - 8)].strip()

def parseRequest(request):
    request_fields = request.split(b'\r\n')
    first_line = request_fields[0]
    headers = request_fields[1:]

    parsed_request = []

    for header in headers:
        header_contents = header.split(b':')
        parsed_header = []
        for content in header_contents:
            parsed_header.append(content)
        
        parsed_request.append(parsed_header)
        #parsed_request[key] = value

    return (first_line, parsed_request)
    
    # first_line, headers_only = request.split(b'\r\n', 1)
    # headers = BytesParser().parsebytes(headers_only)

    # for header in headers:
    #     print("-> " + header)
    
    # return (first_line, headers)


def parseInputData(input_string):
    input_data = input_string[2:len(input_string) - 15]
    input_data = input_data.split("&")

    print(input_data)

    author_name = input_data[0][7:] # [7:] => to skip the author= parth of the string
    book_name = input_data[1][5:] # [5:] => to skip the book= parth of the string

    return author_name, book_name


def decodeAuthor(author, book):
    author_name = urllib.parse.unquote(author)
    author_name = author_name.replace("+", " ")

    book_name = urllib.parse.unquote(book)
    book_name = book_name.replace("+", " ")

    return author_name, book_name

while True:
    # Establish connection with client.
    connection, address = my_socket.accept()
    print('Got connection from', address)
    
    request = connection.recv(1024)

    request_type, headers = parseRequest(request)

    print(request_type)

    endpoint = parseEndPoint(request_type)

    if b'GET' in request_type:
        if endpoint == b'/':
            sendFile("./front_end/index.html" , connection)
    elif b'POST' in request_type:
        # len(headers) - 1 is the author and book names in the request
        author_name, book_name = parseInputData(str(headers[len(headers) - 1][0]))

        author_name, book_name = decodeAuthor(author_name, book_name)

        command = "python3 proccess_data.py '" + author_name + "' '" + book_name + "'"
        os.system(command)
        
        sendFile("./front_end/index.html" , connection)
    
    connection.close()

my_socket.close()