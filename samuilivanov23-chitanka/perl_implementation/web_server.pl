use strict;
use Socket;
use IO::Socket;
use DBI qw(:sql_types);
use JSON;
use CGI qw(:standard);
use Encode;
use URI::Encode qw(uri_encode uri_decode);
require './dbconfig.pl';
binmode(STDOUT, "encoding(UTF-8)");


sub parse_form
{
    my $data = $_[0];
    my %data;

    foreach (split /&/, $data)
    {
        my ($key, $val) = split /=/;

        #convert hex to chars
        my $decoded_data = Encode::decode('utf8', uri_decode($val));
        $data{$key} = $decoded_data;
    }

    return %data;
}

sub send_ajax_response
{
    my @x_axis = @{$_[0]};
    my @y_axis = @{$_[1]};
    my $client = $_[2];
    my $error_code = $_[3];

    print $client "HTTP/1.0 200 OK", Socket::CRLF;
    print $client "Content-type: application/json", Socket::CRLF;
    print $client Socket::CRLF;

    #print header('application/json');
    my $json->{"x_axis"} = \@x_axis;
    $json->{"y_axis"} = \@y_axis;
    $json->{"error_code"} = $error_code;
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
            my $error_code;

             #connect to database
            my $database_connection = DBI -> connect("dbi:Pg:dbname=$dbname;host=$dbhost;port=$dbport",  
                                                            $dbusername,
                                                            $dbpassword,
                                                            {AutoCommit => 1, RaiseError => 1}
                                                        ) or die $DBI::errstr;

            # return data for top 10 authors diagram
            if($data{"diagram"} ne "")
            {
                my $sql = 'select name, words_count from authors order by words_count desc limit 10';
                my $sth = $database_connection->prepare($sql);
                $sth->execute();

                while(my @row = $sth->fetchrow_array())
                {
                    push @x_axis, $row[0];
                    push @y_axis, $row[1];
                }

                $error_code = "";
                send_ajax_response(\@x_axis, \@y_axis, $client, $error_code);
            }
            # return data for top 10 books/sentences ranges diagrams
            elsif($data{"author"} ne "" || $data{"book"} ne "")
            {
                # check if either author and book are typed
                if($data{"author"} ne "" && $data{"book"} ne "")
                {
                    # TODO
                    my $sql = "select id from authors where name=?";
                    my $sth = $database_connection->prepare($sql);
                    $sth->bind_param(1, $data{"author"}, { TYPE => SQL_VARCHAR });
                    $sth->execute();

                    my @row = $sth->fetchrow_array();
                    my $author_id = $row[0];

                    print "author_id: " . $author_id . "\n";

                    $sql = "select '1' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on
                    b.id=s.book_id where b.name=? and b.author_id=? and s.words_count>=0 and s.words_count<5 group by s.words_count) as a 
                    union
                    select '2' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=? and b.author_id=? and s.words_count>=5 and s.words_count<10 group by s.words_count) as a
                    union
                    select '3' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=? and b.author_id=? and s.words_count>=10 and s.words_count<15 group by s.words_count) as a
                    union
                    select '4' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=? and b.author_id=? and s.words_count>=15 and s.words_count<20 group by s.words_count) as a                                                                   
                    union
                    select '5' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=? and b.author_id=? and s.words_count>=20 and s.words_count<70 group by s.words_count) as a
                    order by range asc;";

                    my $sth = $database_connection->prepare($sql);

                    $sth->bind_param(1, $data{"book"}, { TYPE => SQL_VARCHAR });
                    $sth->bind_param(2, $author_id, { TYPE => SQL_INTEGER });
                    $sth->bind_param(3, $data{"book"}, { TYPE => SQL_VARCHAR });
                    $sth->bind_param(4, $author_id, { TYPE => SQL_INTEGER });
                    $sth->bind_param(5, $data{"book"}, { TYPE => SQL_VARCHAR });
                    $sth->bind_param(6, $author_id, { TYPE => SQL_INTEGER });
                    $sth->bind_param(7, $data{"book"}, { TYPE => SQL_VARCHAR });
                    $sth->bind_param(8, $author_id, { TYPE => SQL_INTEGER });
                    $sth->bind_param(9, $data{"book"}, { TYPE => SQL_VARCHAR });
                    $sth->bind_param(10, $author_id, { TYPE => SQL_INTEGER });

                    print "book: " . $data{'book'} . "\n";

                    $sth->execute();

                    my %map_ranges = (
                        '1' => '0 - 5 words',
                        '2' => '5 - 10 words',
                        '3' => '10 - 15 words',
                        '4' => '15 - 20 words',
                        '5' => '20 - 70 words',
                    );

                    while(my @row = $sth->fetchrow_array())
                    {
                        print $map_ranges{$row[0]} . "\n";
                        print $row[1] . "\n";
                        push @x_axis, $map_ranges{$row[0]};
                        push @y_axis, $row[1];
                    }
                    
                    print "x_axis: " . @y_axis . "\n";
                    if($y_axis[0] eq $y_axis[1] && $y_axis[1] eq $y_axis[2] && $y_axis[0] eq "")
                    {
                        $error_code = "Author and book tuple not matching"; # error caused by not matching author and book tuple
                        send_ajax_response(\@x_axis, \@y_axis, $client, $error_code);
                    }
                    else
                    {
                        $error_code = ""; # no error
                        send_ajax_response(\@x_axis, \@y_axis, $client, $error_code);
                    }
                }
                #check if only book is typed
                elsif($data{"book"} ne "")
                {
                    my $sql = "select '1' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on
                    b.id=s.book_id where b.name=? and s.words_count>=0 and s.words_count<5 group by s.words_count) as a 
                    union
                    select '2' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=? and s.words_count>=5 and s.words_count<10 group by s.words_count) as a
                    union
                    select '3' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=? and s.words_count>=10 and s.words_count<15 group by s.words_count) as a
                    union
                    select '4' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=? and s.words_count>=15 and s.words_count<20 group by s.words_count) as a                                                                   
                    union
                    select '5' as range, sum(sentences_count) from (select s.words_count, count(s.sentence) as sentences_count from books as b join sentences as s on b.id=s.book_id where b.name=? and s.words_count>=20 and s.words_count<70 group by s.words_count) as a
                    order by range asc;";

                    my $sth = $database_connection->prepare($sql);

                    $sth->bind_param(1, $data{"book"}, { TYPE => SQL_VARCHAR });
                    $sth->bind_param(2, $data{"book"}, { TYPE => SQL_VARCHAR });
                    $sth->bind_param(3, $data{"book"}, { TYPE => SQL_VARCHAR });
                    $sth->bind_param(4, $data{"book"}, { TYPE => SQL_VARCHAR });
                    $sth->bind_param(5, $data{"book"}, { TYPE => SQL_VARCHAR });

                    print "book: " . $data{'book'} . "\n";

                    $sth->execute();

                    my %map_ranges = (
                        '1' => '0 - 5 words',
                        '2' => '5 - 10 words',
                        '3' => '10 - 15 words',
                        '4' => '15 - 20 words',
                        '5' => '20 - 70 words',
                    );

                    while(my @row = $sth->fetchrow_array())
                    {
                        push @x_axis, $map_ranges{$row[0]};
                        push @y_axis, $row[1];
                    }

                    $error_code = "";
                    send_ajax_response(\@x_axis, \@y_axis, $client, $error_code);
                }
                #check if only author is typed
                elsif($data{"author"} ne "")
                {
                    my $sql = "select b.name, b.words_count from authors as a
                                join books as b on a.id=b.author_id
                                where a.name=? order by b.words_count desc limit 10;";
                    my $sth = $database_connection->prepare($sql);
                    $sth->bind_param(1, $data{"author"}, { TYPE => SQL_VARCHAR });
                    $sth->execute();             

                    while(my @row = $sth->fetchrow_array())
                    {
                        push @x_axis, $row[0];
                        push @y_axis, $row[1];
                    }

                    $error_code = "";
                    send_ajax_response(\@x_axis, \@y_axis, $client, $error_code);
                }
                
            }

            $database_connection.close();
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
}