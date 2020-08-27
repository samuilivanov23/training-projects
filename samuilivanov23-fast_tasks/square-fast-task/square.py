import math

A = int(input("A: "))
distances_list = []
distance = 0

while (A <= 0 or A >= 20000):
    print("'A' should be positive between 0 and 20 000!")
    A = int(input("A: "))

i = 0

while i <= 0:
    j = i+1
    while j <= A:
        z = 1
        print(j)
        while z <= A:
            a = j - i
            b = z
            side_a_squared = math.pow(a, 2)
            side_b_squared = math.pow(b, 2)
            distance = math.sqrt(side_a_squared + side_b_squared)

            if distance == int(distance) and (not  distance in distances_list):
                distances_list.append(int(distance))
            
            z+=1
        j+=1
    i+=1

print(distances_list)

if not distances_list:
    print("0 0")
else:
    print(str(max(distances_list)) + " " + str(len(distances_list)))