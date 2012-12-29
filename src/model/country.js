var AirportCreator = function(airport, city) {
	if(!airport.name) throw "name attribute of airport missing";
	if(!airport.code) throw "code attribute of airport missing";
	if(!airport.latitude) throw "latitude attribute of airport missing";
	if(!airport.longitude) throw "longitude attribute of airport missing";
    this.airport = airport;
    this.city = city;
    print("Airport " + airport.name + " created.");
};

AirportCreator.prototype.Airport = function(args) {
    return this.city.Airport(args);
}

AirportCreator.prototype.City = function(args) {
    return this.city.City(args);
}

var CityCreator = function(city, country) {
	if(!city.name) throw "name attribute of city missing";
    this.city = city;
    this.country = country;
    this.airports = [];
    print("City " + city.name + " created");
}

CityCreator.prototype.Airport = function(args) {
    var airport = new AirportCreator(args, this)
    this.airports.push(airport);
    return airport;
}

CityCreator.prototype.City = function(args) {
    return this.country.City(args);
}

var CountryCreator = function(country) {
	if(!country.name) throw "name attribute of country missing";
	if(!country.code) throw "code attribute of country missing";
    this.country = country;
    this.cities = [];
    print("Country " + country.name + " created");
}

CountryCreator.prototype.City = function(args) {
    var city = new CityCreator(args, this)
    this.cities.push(city);
    return city;
}

exports.Country = function(args) {
	return new CountryCreator(args);
};
