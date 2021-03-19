#!/usr/bin/perl

$temp = 0;

while($temp < 5){
    printf qq(iteration: $temp\n);
    $temp++;
}

printf "---------------\n";

until($temp > 10){
    printf "iteration: $temp\n";
    $temp++;
}

@list = (10, 20, 30, 26, 50);

for $item (@list){
    printf "item: $item\n";
}
$length = @list;
printf qq(list length: $#list, $length\n);

@list = InsertionSort(@list);

print qq(Sorted list: @list\n);

$input_line;
while(<STDIN>){
    $input_line = $_;
    chomp($input_line);
    printf "$input_line\n";
}

sub InsertionSort{
    my @list = @_;

    foreach my $i (1..$#list){
        my $j = i;
        my $tmp = $list[$i];
        while($j > 0 && $tmp < $list[$j - 1]){
            $list[$j] = $list[$j - 1];
            $j--;
        }
        $list[$j]=$tmp;
    }

    return @list;
}
