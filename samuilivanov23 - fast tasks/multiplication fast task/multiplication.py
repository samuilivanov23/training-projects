import math

input_number = int(input("Enter a number between 0 and  3 200 000: "))
print(input_number)

quadratics_string = ""

for i in range(1, input_number + 1):
    quadratic_number = int(math.pow(i, 2))
    quadratics_string += str(quadratic_number)

print(quadratics_string)
print(quadratics_string[input_number - 1])