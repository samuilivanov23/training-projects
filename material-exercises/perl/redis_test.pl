#!/usr/bin/perl

use RedisDB;

my $redis = RedisDB->new( host => 'localhost', port => '6379' );
$redis->set( "perl_test", "test_from_perl" );
my $value = $redis->get( "perl_test" );
say $value;
