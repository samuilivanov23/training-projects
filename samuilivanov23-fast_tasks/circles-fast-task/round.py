import math

#n = int(input("n: "))

n = 1000

f = open("../../../notes/circles-input.txt", mode="r")
file_contents = f.read().split("\n")[1:]
f.close()

circles_graph = dict()
x_points = []
y_points = []
radiuses = []

for line in file_contents[:(len(file_contents) - 1)]:
    x_points.append(int(line.split(' ')[0]))
    y_points.append(int(line.split(' ')[1]))
    radiuses.append(int(line.split(' ')[2]))

# while (n < 2 or n > 1000):
#     print("Number not in range: between 1 and 10000")
#     n = int(input("n: "))

# for i in range(n):
#     x = int(input("x" + str(i + 1) + ": "))
#     y = int(input("y" + str(i + 1) + ": "))
#     r = int(input("r" + str(i + 1) + ": "))

#     while (x <= -10000 or x >= 10000) or (y <= -10000 or y >= 10000) or (r <= 0 or r >= 10000):
#         print("Numbers not in range")
#         x = int(input("x" + str(i + 1) + ": "))
#         y = int(input("y" + str(i + 1) + ": "))
#         r = int(input("r" + str(i + 1) + ": "))
    
#     x_points.append(x)
#     y_points.append(y)
#     radiuses.append(r)

i = 0
while i < n:
    j = 0
    while j < n:
        if not i == j:
            x0 = x_points[i]
            y0 = y_points[i]
            r0 = radiuses[i]

            x1 = x_points[j]
            y1 = y_points[j]
            r1 = radiuses[j]

            distance = math.sqrt(math.pow((x1 - x0), 2)+ math.pow((y1 - y0), 2))

            if not ((distance > (r0 + r1)) or 
                   (distance < abs(r0 - r1)) or 
                   (distance == 0 and r0 == r1) or
                   (distance == (r0 + r1)) or
                   (distance == abs(r0 - r1))):

                circle = "A"+str(i)
                intersecting_circle = "A"+str(j)
                
                if circle in circles_graph:    
                    circles_graph[circle].append(intersecting_circle)
                else:
                    circles_graph[circle] = [intersecting_circle]
        j += 1
    i+=1

print(circles_graph)
all_paths = list()
shortest_path = ["A1"]

def find_path(graph, start, end, path=[]):
    path = path + [start]
    if start == end:
        print(path)
        print(start)
        if (len(path) < len(shortest_path)) and not shortest_path == []:
            shortest_path = path
        all_paths.append(path)
        return path

    if not start in graph:
        return None
    
    for circle in graph[start]:
        if not circle in path:
            newpath = find_path(graph, circle, end, path)

    return None

path = find_path(circles_graph, "A0", "A"+str(n-1))
print(all_paths)
print(shortest_path)

if shortest_path == []:
    print(-1)
else:
    result = len(shortest_path) - 1
    print(result)