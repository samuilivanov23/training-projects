import socket
import os

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

while True:
    # Establish connection with client.
    connection, address = my_socket.accept()
    print('Got connection from', address)

    connection.recv(1024)
    # send the initial apache index.html page
    sendFile("/var/www/html/index.html", connection)
    connection.close()

my_socket.close()