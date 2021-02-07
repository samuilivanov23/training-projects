class MyMath:
    def __init__(self):
        self.answer = 0

    def Add(self, first_number, second_number):
        self.answer = first_number + second_number
    
    def Subtract(self, first_number, second_number):
        self.answer = first_number - second_number
    
    def __str__(self):
        return str(self.answer)

class Person:  
    def __init__(self, personName, personAge):
        self.name = personName
        self.age = personAge
  
    def showName(self):  
        print(self.name)
  
    def showAge(self):  
        print(self.age)
          
  
person1 = Person("John", 23)  
person2 = Person("Anne", 102)  
person1.showAge()
person2.showName()

math = MyMath()
math.Add(10,20)
print(math)
math.Subtract(10, 20)
print(math)