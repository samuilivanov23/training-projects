#!/usr/bin/perl

my $input = <STDIN>;

print "----------------------------------\n";
while ($input =~ /(?=\S*[-])([a-zA-Z-]{6,}[0-9]{0,})/g) {
    print "$1 ";
}
print "\n";
