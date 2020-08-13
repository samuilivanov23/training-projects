n = int(input("n: "))
a = int(input("a: "))
b = int(input("b: "))
c = int(input("c: "))

while (n <= 0 or n >= 100000) or (a <= 0 or a >= 100000) or (b <= 0 or b >= 100000) or (c <= 0 or c >= 100000):
    print("All numbers should be positive between 0 and 100 000!")
    n = int(input("n: "))
    a = int(input("a: "))
    b = int(input("b: "))
    c = int(input("c: "))

n+=1
line = [None] * n # None-> empty; 1-> first person dot; 2-> second person dot

#populate the line with dots
i = 0
while i <= (n-1)/a:
    line[i*a] = 1
    i+=1

i = 0
line[n - 1] = 2
while i <= (n-1)/b:
    line[(n - 1) - (i * b)] = 2
    i+=1

painted_red_segment_length = 0
i = 0

#calcualte the length of the painted segment
while i < n:
    if i == 0:
        if (line[i] != line[i + 1]) and (line[i] != None) and (line[i + 1] != None):
            painted_red_segment_length += 1
            i+=1
    elif i == n-1:
        if (line[i] != line[i - 1]) and (line[i] != None) and (line[i - 1] != None):
            painted_red_segment_length += 1
    else:
        if (line[i] != line[i - 1]) and (line[i] != None) and (line[i - 1] != None):
            painted_red_segment_length += 1

        if (line[i] != line[i + 1]) and (line[i] != None) and (line[i + 1] != None):
            painted_red_segment_length += 1
            i+=1
    i+=1

#calculate the length of the segment that is not painted
result = (n-1) - painted_red_segment_length
print("result: " + str(result))