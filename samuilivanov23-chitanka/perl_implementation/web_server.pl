use strict;
use Socket;
use IO::Socket;
use DBI;
require './dbconfig.pl';

sub parse_form 
{
    my $data = $_[0];
    my %data;

    foreach (split /&/, $data) 
    {
        my ($key, $val) = split /=/;
        #substitute "+" with whitespace
        $val =~ s/\+/ /g;
        #convert hex to chars
        $val =~ s/%(..)/chr(hex($1))/eg;
        $data{$key} = $val;
    }

    return %data; 
}

#db config data
our ($dbname);
our ($dbhost);
our ($dbusername);
our ($dbpassword);
our ($dbport);

my $DOCUMENT_ROOT = "/media/samuil2001ivanov/808137c8-9dff-4126-82f4-006ab928a3fc1/training-projects/samuilivanov23-chitanka/perl_implementation";

#create server
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
            print "$_\n";

            #split the http request
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
                $request{lc $type} = $val;
            } 
            # check if end of string/line is reached -> '$'
            elsif (/^$/) 
            {
                last;
            }
        }
    }

    #Take method type

    if ($request{METHOD} eq 'GET') 
    {
        print "URL: " . $request{URL} . "\n";
        #(.*) matches any character except line break
        if ($request{URL} =~ /(.*)\?(.*)/) 
        {
            $request{URL} = $1;
            $request{CONTENT} = $2;
            %data = parse_form($request{CONTENT});

            #connect to database
            my $database_connection = DBI -> connect("dbi:Pg:dbname=$dbname;host=$dbhost;port=$dbport",  
                                                    $dbusername,
                                                    $dbpassword,
                                                    {AutoCommit => 0, RaiseError => 1}
                                                ) or die $DBI::errstr;

        }
        else
        {
            %data = ();
        }
        $data{"_method"} = "GET";
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