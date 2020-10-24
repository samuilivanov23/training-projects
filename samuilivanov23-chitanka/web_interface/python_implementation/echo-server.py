import socket

# '' for the host to accept connections on all available interfaces
SERVER_SOCKET = (HOST, PORT) = ('', 65432) #non-privileged ports are > 1023

# The number of unaccepted connections before the servers starts refusing new incoming conenctions 
UNACCEPTED_CONNECTIONS_QUEUE = 1024

# AF_INTET -> address family for IPv4
# SOCK_STREAM -> socket type for TCP connections
my_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
my_socket.bind(SERVER_SOCKET)
my_socket.listen(UNACCEPTED_CONNECTIONS_QUEUE)

# Establish connection with client.
connection, address = my_socket.accept()

with connection:
    print('Connected by', address)

    while True:
        data = connection.recv(1024)

        if not data:
            break

        connection.sendall(data)

my_socket.close()