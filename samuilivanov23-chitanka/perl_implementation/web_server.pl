use strict;
use Socket;
use IO::Socket;
use DBI;
use JSON;
use CGI qw(:standard);
require './dbconfig.pl';
binmode(STDOUT, "encoding(UTF-8)");


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

sub send_ajax_response
{
    my @x_axis = @{$_[0]};
    my @y_axis = @{$_[1]};
    my $client = $_[2];

    print $client "HTTP/1.0 200 OK", Socket::CRLF;
    print $client "Content-type: application/json", Socket::CRLF;
    print $client Socket::CRLF;

    #print header('application/json');
    my $json->{"x_axis"} = \@x_axis;
    $json->{"y_axis"} = \@y_axis;
    my $json_text = to_json($json);
    print $client $json_text;
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
        $data{"_method"} = "GET";
        
        print "URL: " . $request{URL} . "\n";
        #(.*) matches any character except line break
        if ($request{URL} =~ /(.*)\?(.*)/) 
        {
            $request{URL} = $1;
            $request{CONTENT} = $2;
            %data = parse_form($request{CONTENT});

            my @x_axis = ();
            my @y_axis = ();

            # return data for top 10 authors diagram
            if($data{"diagram"} ne "")
            {
                #connect to database
                my $database_connection = DBI -> connect("dbi:Pg:dbname=$dbname;host=$dbhost;port=$dbport",  
                                                                $dbusername,
                                                                $dbpassword,
                                                                {AutoCommit => 1, RaiseError => 1}
                                                            ) or die $DBI::errstr;

                my $sql = 'select name, words_count from authors order by words_count desc limit 10';
                my $sth = $database_connection->prepare($sql);
                $sth->execute();

                while(my @row = $sth->fetchrow_array())
                {
                    push @x_axis, $row[0];
                    push @y_axis, $row[1];
                }

                $database_connection.close();

                send_ajax_response(\@x_axis, \@y_axis, $client);
            }
            # return data for top 10 books/sentences ranges diagrams
            elsif($data{"author"} ne "" || $data{"book"} ne "")
            {
                my $first_start = '0';
                my $first_end = '5';
                my $second_end = '10';
                my $third_end = '15';
                my $fourth_end = '20';
                my $fifth_end = '70';

                # check if either author and book are typed
                if($data{"author"} ne "" && $data{"book"} ne "")
                {
                    # TODO
                }
                #check if only book is typed
                if($data{"book"} ne "")
                {

                    my $database_connection = DBI -> connect("dbi:Pg:dbname=$dbname;host=$dbhost;port=$dbport",  
                                                            $dbusername,
                                                            $dbpassword,
                                                            {AutoCommit => 1, RaiseError => 1}
                                                        ) or die $DBI::errstr;

                    my $sql = "select '1' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on
                    b.id=s.book_id where b.id=? and s.words_count>=? and s.words_count<? group by s.words_count) as a 
                    union
                    select '2' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.id=? and s.words_count>=? and s.words_count<? group by s.words_count) as a
                    union
                    select '3' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.id=? and s.words_count>=? and s.words_count<? group by s.words_count) as a
                    union
                    select '4' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.id=? and s.words_count>=? and s.words_count<? group by s.words_count) as a                                                                   
                    union
                    select '5' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.id=? and s.words_count>=? and s.words_count<? group by s.words_count) as a
                    order by range asc;";

                    my $sth = $database_connection->prepare($sql);
                    $sth->execute($data{'book'}, $first_start, $first_end,
                                    $data{'book'}, $first_end, $second_end,
                                    $data{'book'}, $second_end, $third_end,
                                    $data{'book'}, $third_end, $fourth_end,
                                    $data{'book'}, $fourth_end, $fifth_end);

                    while(my @row = $sth->fetchrow_array())
                    {
                        print "test\n";
                        print "range = ". $row[0] . "\n";
                        print "sentences_count = ". $row[1] ."\n\n";
                    }
                    
                    $database_connection.close();
                }
                #check if only author is typed
                if($data{"author"} ne "")
                {
                    my $database_connection = DBI -> connect("dbi:Pg:dbname=$dbname;host=$dbhost;port=$dbport",  
                                                            $dbusername,
                                                            $dbpassword,
                                                            {AutoCommit => 1, RaiseError => 1}
                                                        ) or die $DBI::errstr;

                    my $sql = "select b.name, b.words_count from authors as a
                                join books as b on a.id=b.author_id
                                where a.id=? order by b.words_count desc limit 10;";
                    my $sth = $database_connection->prepare($sql);
                    $sth->execute($data{'author'});                    $database_connection.close();


                    while(my @row = $sth->fetchrow_array())
                    {
                        push @x_axis, $row[0];
                        push @y_axis, $row[1];
                    }

                    $database_connection.close();

                    send_ajax_response(\@x_axis, \@y_axis, $client);
                }
                
            }
        }
        else
        {
            %data = ();
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
                print $client "HTTP/1.1 404 Not Found", Socket::CRLF;
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
    }
    else 
    {
        $data{"_method"} = "ERROR";
    }
}