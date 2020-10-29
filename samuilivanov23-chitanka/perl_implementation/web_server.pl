use IO::Socket;
use strict;
use Log::Log4perl;

my $socket = new IO::Socket::INET->new (
    LocalHost => 'localhost',
    LocalPort => "1024",
    Type => SOCK_STREAM,
    Reuse => 1,
    Listen => SOMAXCONN
)
or die ("bind: $!\n");

warn $socket;

print "Waiting for client to connect..";

my $new_socket = $socket->accept();

while(<$new_socket>)
{
    print $_;
}

close($socket)