import math

n = int(input("n: "))

while (n < 2 or n > 1000):
    print("Number not in range: between 1 and 10000")
    n = int(input("n: "))

circles_graph = dict()
x_points = []
y_points = []
radiuses = []

for i in range(n):
    x = int(input("x" + str(i + 1) + ": "))
    y = int(input("y" + str(i + 1) + ": "))
    r = int(input("r" + str(i + 1) + ": "))

    while (x <= -10000 or x >= 10000) or (y <= -10000 or y >= 10000) or (r <= 0 or r >= 10000):
        print("Numbers not in range")
        x = int(input("x" + str(i + 1) + ": "))
        y = int(input("y" + str(i + 1) + ": "))
        r = int(input("r" + str(i + 1) + ": "))
    
    x_points.append(x)
    y_points.append(y)
    radiuses.append(r)

i = 0
while i < n - 1:
    j = i + 1
    while j < n:
        x0 = x_points[i]
        y0 = y_points[i]
        r0 = radiuses[i]

        x1 = x_points[j]
        y1 = y_points[j]
        r1 = radiuses[j]

        intersection_points = []
        distance = math.sqrt(math.pow((x1 - x0), 2)+ math.pow((y1 - y0), 2))

        if not (distance > (r0 + r1) or ( distance < abs(r0 - r1)) or (distance == 0 and r0 == r1)):
            a = (math.pow(r0, 2) - math.pow(r1, 2) + math.pow(distance, 2)) / (2*distance)
            h = math.sqrt(math.pow(r0, 2) - math.pow(a, 2))

            x2 =  x0 + a * (x1 - x0) / distance
            y2 = y0 + a * (y1 - x0) / distance
            x3 = x2 + h * (y1 - y0) / distance
            y3 = y2 - h * (x1 - x0) / distance

            x2 = round(x2, 2)
            y2 = round(y2, 2)

            x3 = round(x3, 2)
            y3 = round(y3, 2)
            
            if not ((x3 == x2) and (y3 == y2)):
                ##create arc between circles TODO
                circle = "A"+str(i)
                intersecting_circle = "A"+str(j)
                
                if circle in circles_graph:    
                    circles_graph[circle].append(intersecting_circle)
                else:
                    circles_graph[circle] = [intersecting_circle]
        j += 1
    i+=1

def find_path(graph, start, end, path=[]):
    path = path + [start]
    if start == end:
        return path

    if not start in graph:
        return None
    
    for circle in graph[start]:
        if circle not in path:
            newpath = find_path(graph, circle, end, path)
            
            if newpath: 
                return newpath
    return None

path = find_path(circles_graph, "A0", "A"+str(n-1))
if path == None:
    print(-1)
else:
    print(len(path) - 1)