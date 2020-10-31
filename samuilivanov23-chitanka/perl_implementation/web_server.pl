use strict;
use Socket;
use IO::Socket;

sub parse_form 
{
    my $data = $_[0];
    my %data;

    foreach (split /&/, $data) 
    {
        my ($key, $val) = split /=/;
        $val =~ s/\+/ /g;
        $val =~ s/%(..)/chr(hex($1))/eg;
        $data{$key} = $val;
    }
    return %data; 
}

my $DOCUMENT_ROOT = "/media/samuil2001ivanov/808137c8-9dff-4126-82f4-006ab928a3fc1/training-projects/samuilivanov23-chitanka/perl_implementation";
#print $DOCUMENT_ROOT."\n";

my $server = new IO::Socket::INET->new (
    LocalHost => '',
    LocalPort => "1024",
    Type => SOCK_STREAM,
    Reuse => 1,
    Listen => SOMAXCONN
);

$server or die "Unable to create server socket: $!";

while (my $client = $server->accept()) {
    $client->autoflush(1);
    my %request = ();
    my %data;

    {
        #Read the request
        local $/ = Socket::CRLF;
        while (<$client>) 
        {
            chomp; # Get the main http request
            if (/\s*(\w+)\s*([^\s]+)\s*HTTP\/(\d.\d)/) 
            {
                $request{METHOD} = uc $1;
                $request{URL} = $2;
                $request{HTTP_VERSION} = $3;
            } 
            # Standard headers
            elsif (/:/) 
            {
                (my $type, my $val) = split /:/, $_, 2;
                
                $type =~ s/^\s+//;
                foreach ($type, $val) 
                {
                    s/^\s+//;
                    s/\s+$//;
                }
                
                $request{lc $type} = $val;
            } # POST data
            elsif (/^$/) 
            {
                read($client, $request{CONTENT}, $request{'content-length'})
                    if defined $request{'content-length'};
                last;
            }
        }
    }

    #Take method type

    if ($request{METHOD} eq 'GET') 
    {
        if ($request{URL} =~ /(.*)\?(.*)/) 
        {
                $request{URL} = $1;
                $request{CONTENT} = $2;
                %data = parse_form($request{CONTENT});
        } 
        else 
        {
                %data = ();
        }
        $data{"_method"} = "GET";
    } 
    elsif ($request{METHOD} eq 'POST') 
    {
                %data = parse_form($request{CONTENT});
                $data{"_method"} = "POST";
    } 
    else 
    {
        $data{"_method"} = "ERROR";
    }

        #Serve file
        my $endpoint = $DOCUMENT_ROOT . "/front_end/index.html";
        print "endpoint: " . $endpoint . "\n";

        # Send response
        if (open(FILE, "$endpoint")) 
        {
            print $client "HTTP/1.0 200 OK", Socket::CRLF;
            print $client "Content-type: text/html", Socket::CRLF;
            print $client Socket::CRLF;
            my $buffer;
            while (read(FILE, $buffer, 8192)) 
            {
                print $client $buffer;
            }
            $data{"_status"} = "200";
        }
        else
        {
            print $client "HTTP/1.0 404 Not Found", Socket::CRLF;
            print $client Socket::CRLF;
            print $client "<html><body>404 Not Found</body></html>";
            $data{"_status"} = "404";
        }
        close(FILE);

        # Log request
        foreach (keys(%data)) 
        {
                print ("   $_ = $data{$_}\n"); 
        }

    #close connection
    close $client;
}