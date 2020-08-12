import math

input_number = int(input("Enter a number between 0 and  3 200 000: "))

while input_number < 0 or input_number > 3200000:
    print("Number is out of range! Please enter another number: ")
    input_number = int(input("Enter a number between 0 and  3 200 000: "))

quadratics_string = ""

if input_number == 0:
    print(0)
else:
    for i in range(1, input_number + 1):
        quadratic_number = int(math.pow(i, 2))
        quadratics_string += str(quadratic_number)

    print(quadratics_string[input_number - 1])