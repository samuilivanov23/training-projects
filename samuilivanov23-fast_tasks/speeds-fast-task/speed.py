maxSpeed = 30000
minSpeed = 1
roads = []

class Route:
    def __init__(self, city1, city2, optimalSpeed):
        self.city1 = city1
        self.city2 = city2
        self.optimalSpeed = optimalSpeed

def IsPathCorrect(roadsConnections,cities):
    count = 0
    queue = []
    visitetConnections = [0]*numRoutes
    visitetConnections[1] = 1 # if value = 1 => connection is visited
    queue.append(1)
    count += 1

    while len(queue) != 0:
        position = queue[0]
        queue.pop(0)
        for i in roadsConnections[position]:
            if visitetConnections[i] != 1:
                visitetConnections[i] = 1
                queue.append(i)
                count += 1
    return cities == count 

# get input data
inputData = input().split()
numCities = int(inputData[0])
numRoutes = int(inputData[1])

while (numCities < 2 or numCities > 1000) or (numRoutes < 1 or numRoutes > 10000):
    print("Numbers not in range")
    inputData = input().split()
    numCities = int(inputData[0])
    numRoutes = int(inputData[1])

#populate the 
for i in range(numRoutes):
    inputData = input().split()
    city1 = int(inputData[0])
    city2 = int(inputData[1])
    optimalSpeed = int(inputData[2])
    
    while (city1 < 1 or city1 > numCities) or (city2 < 1 or city2 > numCities) or (optimalSpeed < 1 or optimalSpeed > 30000):
        print("Numbers not in range")
        inputData = input().split()
        city1 = int(inputData[0])
        city2 = int(inputData[1])
        optimalSpeed = int(inputData[2])

    roads.append(Route(city1, city2, optimalSpeed))

roads.sort(key=lambda r: r.optimalSpeed)

roadIndexes = []
roadsConnections = [[] for i in range(numRoutes)]

for i in range(len(roads)):
    #populate intersecting routes
    roadsConnections[roads[i].city1].append(roads[i].city2)
    roadsConnections[roads[i].city2].append(roads[i].city1)

    roadIndexes.append(i)

    while len(roadIndexes) != 0 and IsPathCorrect(roadsConnections,numCities):
        firstRoute = roadIndexes[0]

        #check if the current path speed difference is smaller than the current speed difference
        if (roads[i].optimalSpeed - roads[firstRoute].optimalSpeed < maxSpeed - minSpeed):
            
            minSpeed = roads[firstRoute].optimalSpeed
            maxSpeed = roads[i].optimalSpeed

        #remove visited path
        roadIndexes.pop(0)
        roadsConnections[roads[firstRoute].city1].pop(0)
        roadsConnections[roads[firstRoute].city2].pop(0)
	
print(str(minSpeed) + " " + str(maxSpeed))