class Number:
    def __init__(self, start_number):
        self.data = start_number
    
    def __sub__(self, other_number):
        return Number(self.data - other_number)

class Indexer:
    def __init__(self, start, stop):
        self.name = "Test"
        self.value = start - 1
        self.stop = stop
    
    def __getitem__(self, index):
        if isinstance(index, int):
            print("getitem: ", index)
            return self.name[index]
        else:
            print("slicing", index.start, index.stop, index.step)
            return self.name[index.start:index.stop:index.step]
    
    def __index__(self):
        return 10
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.value == self.stop:
            raise StopIteration
        self.value += 1
        return self.value

class Iters:
    def __init__(self, value):
        self.data = value

    def __getitem__(self, i):
        print('get[%s]:' % i, end='')
        return self.data[i]

    def __iter__(self):
        print('iter=> ', end='')
        self.ix = 0
        return self

    def __next__(self):
        print('next:', end='')
        if self.ix == len(self.data): raise StopIteration
        item = self.data[self.ix]
        self.ix += 1
        return item

    def __contains__(self, x):
        print('contains: ', end='')
        return x in self.data
        next = __next__

if __name__ == '__main__':
    num = Number(10)
    result = num - 3
    print(result.data)

    indexer = Indexer(1, 4)
    print(indexer[2])
    print(indexer[0:4:2])

    print(hex(indexer)) #return A because 10 is A in hex

    for i in Indexer(0,3):
        print(i)

    X = Iters([1, 2, 3, 4, 5])
    print(3 in X)
    
    for i in X: # for loops
        print(i, end=' | ')
    print()
    print([i ** 2 for i in X])
    print(list(map(bin, X)))