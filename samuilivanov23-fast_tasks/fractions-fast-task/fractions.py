z = int(input("z: "))
m = int(input("m: "))
n = int(input("n: "))

while (z < 1 or z > 50000000) or (m < 1 or m > 100000) or (n < 1 or n > 100000):
    print("Numbers not in range")
    z = int(input("z: "))
    m = int(input("m: "))
    n = int(input("n: "))

p, q = m, n

while q <= z:
    if p == q:
        q += 1
        p = 1
    if (not q%p == 0) and (p/q > m/n):
        break
    p+=1

print("p: " + str(p))
print("q: " + str(q))