Country{ name: "Belgium", code: "BE" }
	.City{ name: "Brussels", timezone: "Europe/Brussels" }

Country{ code: "BE" }.City{ name: "Charleroi", timezone: "Europe/Brussels" }

Country{ name: "United Kingdom", code: "UN" }
	.City{ name: "London", timezone: "Europe/London" }
		.Airport{ name: "Charles De Gaulle", code: "CDGA", latitude: 23, longitude: 40 }

Country{ code: "UN" }.City{ name: "London"}
		.Airport{ name: "Heathrow", code: "HEAT", latitude: 0.1, longitude: 55 }
