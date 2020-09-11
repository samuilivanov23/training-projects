n = int(input("n: "))
k = int(input("k: "))

while (n < 1 or n > 1000) or (k < 1 or k > 1000):
    print("Numbers not in range: between 1 and 1000")
    n = int(input("n: "))
    k = int(input("k: "))

goat_weights = []

for i in range(n):
    a = int(input("a" + str(i + 1) + ": "))
    while (a < 1 or a > 100000):
        print("Weirht not in range: between 1 and 100000")
        a = int(input("a" + str(i + 1) + ": "))
    
    goat_weights.append(a)

goat_weights.sort()
goat_weights.reverse()
sum_weight = sum(goat_weights)
rift_capacity = int(sum_weight / k)

while True:
    goats_taken = []
    num_courses = 0
    while num_courses < k:
        index=0
        current_load = 0

        while index < len(goat_weights):
            if not goat_weights.count(goat_weights[index]) == goats_taken.count(goat_weights[index]):
                if (current_load + goat_weights[index]) > rift_capacity:
                    index+=1
                else:
                    current_load += goat_weights[index]
                    goats_taken.append(goat_weights[index])
                    index+=1
            else:
                index+=1
                    
        num_courses += 1
    
    goats_taken.sort()
    goats_taken.reverse()
    if goat_weights == goats_taken:
        break
    else:
        rift_capacity += 1

print(rift_capacity)