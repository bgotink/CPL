Country{ name: "Belgium", code: "BEL" }
	.City{ name: "Brussels" }

Country.get{ code: "BEL" }.City{ name: "Charleroi" }

Country{ name: "United Kingdom", code: "UNK" }
	.City{ name: "London" }
		.Airport{ name: "Charles De Gaulle", code: "CDG", latitude: 23, longitude: 40 }

Country.get{ code: "UNK" }.City.get{ name: "London"}
		.Airport{ name: "Heathrow", code: "HEA", latitude: 0.1, longitude: 55 }
