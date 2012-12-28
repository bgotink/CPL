var AirportCreator = function(airport, city) {
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