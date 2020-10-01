import math
#2)
def adder(arg1, arg2):
    return arg1 + arg2

print(adder(5, 7)) # -> 12
print(adder("5", "7")) # -> 57
print(adder([1, 2], [3, 4])) # -> [1, 2, 3 ,4]

#3)
def adder_(good= 3, bad = 4, ugly=5):
    return good + bad + ugly

print(adder_())
print(adder_(good=2))
print(adder_(bad=2))
print(adder_(ugly=2))
print(adder_(ugly=1, good=2))

#6)
def addDict(dict1, dict2):
    result = [dict1[item] for item in dict1]
    result = result + [dict2[item] for item in dict2]
    return result

dict1 = dict()
dict2 = dict()

dict1["Name"] = "Sample"
dict1["phone"] = "092312421"

dict2["Name"] = "TestingName"
dict2["mail"] = "test@mail.bg"

result = addDict(dict1, dict2)
print(result)

#9)
my_list = [2, 4, 9 , 16, 25]

#9.1) with for loop
new_list = []
for number in my_list:
    new_list.append(math.sqrt(number))

print(new_list)
new_list = []

#9.2) with map
new_list = list(map(lambda x: math.sqrt(x), my_list))
print(new_list)
new_list = []

#9.3) as a generator expression / list comprehension
new_list = [math.sqrt(number) for number in my_list]
print(new_list)
new_list = []

#10)
def counter(n):
    if n == 0:
        print("stop")
    else:
        print(n)
        counter(n-1)

counter(5)