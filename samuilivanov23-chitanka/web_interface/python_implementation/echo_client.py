import socket

SERVER_SOCKET = (HOST, PORT) = ('', 65432)
BUFFER_SIZE = 1024

my_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
my_socket.connect(SERVER_SOCKET)
my_socket.sendall(b'Testing send/recv data')
data = my_socket.recv(BUFFER_SIZE)

print("Received", repr(data))