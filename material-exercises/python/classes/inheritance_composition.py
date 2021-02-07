class Bird: 
    def __init__(self, id, name):
        self.id = id
        self.name = name
    
    def intro(self): 
        print("There are many types of birds.") 
      
    def flight(self): 
        print("Most of the birds can fly but some cannot.") 

class Sparrow(Bird): 
    def __init__(self, id, name, age, factor):
        super().__init__(id, name)
        self.factor = factor
        self.age = factor

    def flight(self): 
        print("Sparrows can fly.") 

    def CalculateAge(self):
        return self.age * self.factor


class Flamingo(Bird):
    def __init__(self, id, name, age, aging_speed):
        super().__init__(id, name)
        self.age = age
        self.aging_speed = aging_speed

    def flight(self): 
        print("Flamingo cannot fly.")

    def CalculateAge(self):
        return self.age * self.aging_speed

class AnimalSystem:
    def CalculateAge(self, animals):
        print("Calculate full age sum")
        sum_age = 0
        for animal in animals:
            print("animal %s: %s" % (str(animal.id), animal.name))
            sum_age += animal.CalculateAge()
        
        print("sum_age: %d" % sum_age)

      
obj_bird = Bird(1, "BirdName")
obj_spr = Sparrow(2, "SparrowName", 3, 2) 
obj_fla = Flamingo(3, "FlamingoName", 7, 5) 
  
obj_bird.intro() 
obj_bird.flight() 
  
obj_spr.intro() 
obj_spr.flight() 
  
obj_fla.intro() 
obj_fla.flight()

animal_system = AnimalSystem()
animal_system.CalculateAge([
    obj_spr,
    obj_fla
])