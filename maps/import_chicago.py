import sys

with open(str(sys.argv[1]),'r') as f: 
	c = 0
	for line in f: 
		c += 1
		if c > 200:
			break;
		if c == 1:
			print("latitude,longitude,offense,time,month,day,year,magnitude,city")
			continue;
		splitLine = line.split(",")
		latitude = splitLine[19]
		# hack to weed out corrupt data
		if (float(latitude) > 1900):
			continue;
		longitude = splitLine[20]
		offense = splitLine[5].title()
		
		date_time_m = splitLine[2].split()
		month = date_time_m[0].split('/')[0]
		day = date_time_m[0].split('/')[1]
		year = date_time_m[0].split('/')[2]
		time12 = date_time_m[1].split(':')
		hour = int(time12[0])
		minute = time12[1]
		am_pm = date_time_m[2]
		if (am_pm=="PM"):
			hour += 12
		time = str(hour) + ":" + minute
		magnitude = "3"
		city = "Chicago"

		print latitude+","+longitude+","+offense+","+time+","+month+","+day+","+year+","+magnitude+","+city;
