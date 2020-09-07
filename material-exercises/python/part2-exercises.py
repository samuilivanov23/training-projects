#1. Define a string S of four characters again: S = "spam". Write an assignment that changes the string to "slam", using only slicing and concatenation.

S = "spam"
S = S[0] + "l" + S[2:len(S)]
print(S)


#2. Define a string S of four characters again: S = "spam". Write an assignment that changes the string to "slam", using only slicing and concatenation.

person = {"name" : {"first" : "Samuil",
                    "middle" : "Valentinov",
                    "last" : "Ivanov"}, 
          "age" : 19,
          "job" : "none",
          "address" : "example address",
          "email" : "example.com"}

for item in person:
	print(person[item])
	
#3. Write a script that creates a new output file called myfile.txt and writes the string "Hello file world!" into it. Then write another script that opens myfile.txt and reads and prints its contents.

f = open("myfile.txt", "w+")
f.write("Hello file world!")
f.close()

f = open("myfile.txt", "r")
file_contents = f.read()
print(file_contents)
