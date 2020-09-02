from operator import attrgetter
class Fraction:
    def __init__(self, numerator, denominator):
        self.numerator = numerator
        self.denominator = denominator
        self.fraction = numerator/denominator

z = int(input("z: "))
m = int(input("m: "))
n = int(input("n: "))

while (z < 1 or z > 50000000) or (m < 1 or m > 100000) or (n < 1 or n > 100000):
    print("Numbers not in range")
    z = int(input("z: "))
    m = int(input("m: "))
    n = int(input("n: "))p, q = 1, 2

fractions = [Fraction(1,2)]

while q < z:
    if p == q:
        q += 1
        p = 2
        fraction = Fraction(1, q)
        fractions.append(fraction)
    if (not q%p == 0) and (p/q > m/n):
        fractions.append(Fraction(p, q))
    p+=1

fractions.sort(key=lambda x: x.fraction)

for fraction in fractions:
    if fraction.fraction > m/n:
        p = fraction.numerator
        q = fraction.denominator
        break

print("p: " + str(p))
print("q: " + str(q))