import os

files = folders = 0

for _, dirnames, filenames in os.walk("../books"):
  # ^ this idiom means "we won't be using this value"
    files += len(filenames)
    folders += len(dirnames)

print("Number of books: " + str(files))
print("Number of authors: " + str(folders))