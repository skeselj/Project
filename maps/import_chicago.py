import sys

with open(str(sys.argv[1]),'r') as f: 
	c = 0
	for line in f: 
		if c > 1:
			break;
		splitLine = line.split() 
		print splitLine
		c += 1
