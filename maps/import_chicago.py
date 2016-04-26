import sys

with open(str(sys.argv[1]),'r') as f: 
	c = 0
	for line in f: 
		c += 1
		# if c == 1:
			# print("latitude,longitude,offense,time,month,day,year,magnitude,city")
			# continue;
		splitLine = line.split(",")
		latitude = splitLine[19]
		# hack to weed out corrupt data
		if (float(latitude) > 1900):
			continue;
		longitude = splitLine[20]

		x = splitLine[5].title();

		if (x == "Narcotics" or x == "Liquor Law Violation" or x == "Other Narcotic Violation"):
			offense = "Drug/Alcohol Violation"
		elif (x == "Theft" or x == "Robbery" or x == "Burglary" or x == "Motor Vehicle Theft"):
			offense = "Theft"
		elif (x == "Other Offense" or x == "Criminal Trespass" or x == "Interference With Public Officer" or x == "Public Peace Violation" or x == "Public Indecency" or x == "Non - Criminal" or x == "Intimidation" or x == "Non-Criminal" or x == "Obscenity" or x == "Gambling"):
			offense = "Minor Offense"
		elif (x == "Homicide"):
			offense = "Homicide"
		elif (x == "Crim Sexual Assault" or x == "Stalking"):
			offense = "Sexual Assault"
		elif (x == "Sex Offense" or x == "Prostitution"):
			offense = "Sex/Prostitution"
		elif (x == "Assault" or x == "Battery"):
			offense = "Assault"
		elif (x == "Deceptive Practice"):
			offense = "Fraud"
		elif (x == "Criminal Damage" or x == "Arson"):
			offense = "Criminal Damage"
		elif (x == "Concealed Carry License Violation" or x == "Weapons Violation"):
			offense = "Weapons Violation"
		elif (x == "Human Trafficking" or x == "Kidnapping"):
			offense = "Trafficking"
		else:
			offense = "Offense Involving Children"
		
		date_time_m = splitLine[2].split()
		month = date_time_m[0].split('/')[0]
		day = date_time_m[0].split('/')[1]
		year = date_time_m[0].split('/')[2]
		time12 = date_time_m[1].split(':')
		hour = int(time12[0])
		hour_s = str(hour)
		minute = time12[1]
		am_pm = date_time_m[2]
		if (am_pm=="PM"):
			hour += 12
		if hour < 10:
			hour_s = "0"+hour_s
		time = hour_s + ":" + minute
		magnitude = "3"
		city = "Chicago"

		print latitude+","+longitude+","+offense+","+time+","+month+","+day+","+year+","+magnitude+","+city;
