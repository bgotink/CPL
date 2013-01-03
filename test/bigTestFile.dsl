Country{ name: "Belgium", code: "BE" }
	.City{ name: "Brussels" }
		.Airport{ name: "Brussels Airport", code: "BRU", latitude: 50.901389, longitude: 4.484444 }
	.City{ name: "Charleroi"}
		.Airport{ name: "Brussels South Charleroi Airport", code: "CRL", latitude: 50.46, longitude: 4.452778}

Country{ name: "United Kingdom", code: "UK"}
	.City{ name: "London" }
		.Airport{ name: "London City Airport", code: "LCY", latitude: 51.505278, longitude: 0.055278}
		.Airport{ name: "London Gatwick Airport", code: "LGW", latitude: 51.148056, longitude: -0.190278}
		.Airport{ name: "London Heathrow Airport", code: "LHR", latitude: 51.4775, longitude:  -0.461389}	

Country{ name: "Netherlands", code: "NL"}
	.City{ name: "Amsterdam"}
		.Airport{ name: "Amsterdam Airport Schiphol", code: "AMS", latitude: 52.308056, longitude: 4.764167}

Airline{ name: "Brussels Airlines", code: "BEL"}

AircraftModel{ name: "A380", manufacturer: "Airbus", code: "A380-800" }

Airline{ code: "BEL" }
  .AircraftLayout{ name: "A380-2Classed", modelCode: "A380-800" }
   .SeatClass{ name: "Economy", code: "A" }
	.Seat{row: 1, letter: "A"}
	.Seat{row: 2, letter: "A"}
	.Seat{row: 3, letter: "A"}
	.Seat{row: 4, letter: "A"}
	.Seat{row: 5, letter: "A"}
	.Seat{row: 6, letter: "A"}
	.Seat{row: 7, letter: "A"}
	.Seat{row: 8, letter: "A"}
	.Seat{row: 9, letter: "A"}
	.Seat{row: 10, letter: "A"}
	.Seat{row: 11, letter: "A"}
	.Seat{row: 12, letter: "A"}
	.Seat{row: 13, letter: "A"}
	.Seat{row: 14, letter: "A"}
	.Seat{row: 15, letter: "A"}
   .SeatClass{ name: "Business", code: "B" }
	.Seat{row: 1, letter: "K"}
	.Seat{row: 2, letter: "K"}
	.Seat{row: 3, letter: "K"}
	.Seat{row: 4, letter: "K"}
	.Seat{row: 5, letter: "K"}
	.Seat{row: 6, letter: "K"}
	.Seat{row: 7, letter: "K"}
	.Seat{row: 8, letter: "K"}
	.Seat{row: 9, letter: "K"}
	.Seat{row: 10, letter: "K"}
	.Seat{row: 11, letter: "K"}
	.Seat{row: 12, letter: "K"}
	.Seat{row: 13, letter: "K"}
	.Seat{row: 14, letter: "K"}
	.Seat{row: 15, letter: "K"}

AircraftModel{ name: "737", manufacturer: "Boeing", code: "Boeing737" }

Airline{ code: "BEL" }
  .AircraftLayout{ name: "737-2Classed", modelCode: "Boeing737" }
   .SeatClass{ name: "Economy", code: "A" }
	.Seat{row: 1, letter: "A"}
	.Seat{row: 2, letter: "A"}
	.Seat{row: 3, letter: "A"}
	.Seat{row: 4, letter: "A"}
	.Seat{row: 5, letter: "A"}
	.Seat{row: 6, letter: "A"}
	.Seat{row: 7, letter: "A"}
	.Seat{row: 8, letter: "A"}
	.Seat{row: 9, letter: "A"}
	.Seat{row: 10, letter: "A"}
	.Seat{row: 11, letter: "A"}
	.Seat{row: 12, letter: "A"}
	.Seat{row: 13, letter: "A"}
	.Seat{row: 14, letter: "A"}
	.Seat{row: 15, letter: "A"}
   .SeatClass{ name: "Business", code: "B" }
	.Seat{row: 1, letter: "B"}
	.Seat{row: 2, letter: "B"}
	.Seat{row: 3, letter: "B"}
	.Seat{row: 4, letter: "B"}
	.Seat{row: 5, letter: "B"}
	.Seat{row: 6, letter: "B"}
	.Seat{row: 7, letter: "B"}
	.Seat{row: 8, letter: "B"}
	.Seat{row: 9, letter: "B"}
	.Seat{row: 10, letter: "B"}
	.Seat{row: 11, letter: "B"}
	.Seat{row: 12, letter: "B"}
	.Seat{row: 13, letter: "B"}
	.Seat{row: 14, letter: "B"}
	.Seat{row: 15, letter: "B"}
   .SeatClass{ code: "A" }
	.Seat{row: 7, letter: "C"}
	.Seat{row: 8, letter: "C"}
	.Seat{row: 9, letter: "C"}
	.Seat{row: 10, letter: "C"}
	.Seat{row: 11, letter: "C"}
	.Seat{row: 12, letter: "C"}
	.Seat{row: 13, letter: "C"}
	.Seat{row: 14, letter: "C"}
	.Seat{row: 15, letter: "C"}
	.Seat{row: 7, letter: "D"}
	.Seat{row: 8, letter: "D"}
	.Seat{row: 9, letter: "D"}
	.Seat{row: 10, letter: "D"}
	.Seat{row: 11, letter: "D"}
	.Seat{row: 12, letter: "D"}
	.Seat{row: 13, letter: "D"}
	.Seat{row: 14, letter: "D"}
	.Seat{row: 15, letter: "D"}
	.Seat{row: 1, letter: "E"}
	.Seat{row: 2, letter: "E"}
	.Seat{row: 3, letter: "E"}
	.Seat{row: 4, letter: "E"}
	.Seat{row: 5, letter: "E"}
	.Seat{row: 6, letter: "E"}
	.Seat{row: 7, letter: "E"}
	.Seat{row: 8, letter: "E"}
	.Seat{row: 9, letter: "E"}
	.Seat{row: 10, letter: "E"}
	.Seat{row: 11, letter: "E"}
	.Seat{row: 12, letter: "E"}
	.Seat{row: 13, letter: "E"}
	.Seat{row: 14, letter: "E"}
	.Seat{row: 15, letter: "E"}
	.Seat{row: 1, letter: "F"}
	.Seat{row: 2, letter: "F"}
	.Seat{row: 3, letter: "F"}
	.Seat{row: 4, letter: "F"}
	.Seat{row: 5, letter: "F"}
	.Seat{row: 6, letter: "F"}
	.Seat{row: 7, letter: "F"}
	.Seat{row: 8, letter: "F"}
	.Seat{row: 9, letter: "F"}
	.Seat{row: 10, letter: "F"}
	.Seat{row: 11, letter: "F"}
	.Seat{row: 12, letter: "F"}
	.Seat{row: 13, letter: "F"}
	.Seat{row: 14, letter: "F"}
	.Seat{row: 15, letter: "F"}
/*
FlightDescription{flight_number: "1", distance: 1000, departure_time: "tododeptime", arrival_time: "todoarrtime"}
	.FlightDescriptionPeriod{validFrom: "todovalidfrom", validTo: "todovalidto", dayOfMonth: "tododayofmonth", dayOfWeek:"tododayofweek"}
		.Price{price: 200, seatClass: "boeingE"}
		.DateException{day: "tododay", month: "todomonth"}
		.Price{price: 700, seatClass: "boeingF"}
	.FlightDescriptionPeriod{validFrom: "todovalidfrom", validTo: "todovalidto", dayOfMonth: "tododayofmonth", dayOfWeek:"tododayofweek"}
		.Price{price: 1500, seatClass: "airbusS"}
		.DateException{day: "tododay", month: "todomonth"}
		.Price{price: 700, seatClass: "airbusB"}
		.Price{price: 200, seatClass: "airbusE"}

FlightDescription{flight_number: "2", distance: 2000, departure_time: "tododeptime", arrival_time: "todoarrtime"}
	.FlightDescriptionPeriod{validFrom: "todovalidfrom", validTo: "todovalidto", dayOfMonth: "tododayofmonth", dayOfWeek:"tododayofweek"}
		.Price{price: 1500, seatClass: "airbusS"}
		.Price{price: 700, seatClass: "airbusB"}
		.Price{price: 200, seatClass: "airbusE"}

FlightDescription{flight_number: "3", distance: 3000, departure_time: "tododeptime", arrival_time: "todoarrtime"}
	.FlightDescriptionPeriod{validFrom: "todovalidfrom", validTo: "todovalidto", dayOfMonth: "tododayofmonth", dayOfWeek:"tododayofweek"}
		.Price{price: 200, seatClass: "boeingE"}
		.DateException{day: "tododay", month: "todomonth"}
		.DateException{day: "tododay", month: "todomonth"}
		.Price{price: 700, seatClass: "boeingF"}
*/
