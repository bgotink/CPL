var Sequelize   = require('sequelize')
  , db          = require('../db');

function AirportCreator(airport, city) {
	if(!airport.name) throw "name attribute of airport missing";
	if(!airport.code) throw "code attribute of airport missing";
	if(!airport.latitude) throw "latitude attribute of airport missing";
	if(!airport.longitude) throw "longitude attribute of airport missing";
    
    this.airport = db.Airport.build(airport, ['name', 'code', 'latitude', 'longitude']);
    city.country.chain.add(this.airport.save());
    
    this.city = city;
    print("Airport " + airport.name + " created.");
};

AirportCreator.prototype.Airport = function(args) {
    return this.city.Airport(args);
}

AirportCreator.prototype.City = function(args) {
    return this.city.City(args);
}

function CityCreator(city, country) {
	if(!city.name) throw "name attribute of city missing";

    this.city = db.City.build(city, ['name']);
    country.chain.add(this.city.save());
    
    this.country = country;
    this.airports = [];
    print("City " + city.name + " created");
}

CityCreator.prototype.Airport = function(args) {
    var airport = new AirportCreator(args, this);
    
    this.airports.push(airport);
    this.country.chain.add(this.city.addAirport(airport.airport));
    
    return airport;
}

CityCreator.prototype.City = function(args) {
    return this.country.City(args);
}

function CountryCreator(country) {
	if(!country.name) throw "name attribute of country missing";
	if(!country.code) throw "code attribute of country missing";
    
    this.country = db.Country.build(country, ['name', 'code']);
    
    this.chain = new Sequelize.Utils.QueryChainer();
    db.chain.add(this.chain.runSerially({ skipOnError: true }));
    
    this.chain.add(this.country.save());
    
    this.cities = [];
    print("Country " + country.name + " created");
}

CountryCreator.prototype.City = function(args) {
    var city = new CityCreator(args, this);
    this.cities.push(city);
    this.chain.add(this.country.addCity(city.city));
    return city;
}

exports.Country = function(args) {
	return new CountryCreator(args);
};
