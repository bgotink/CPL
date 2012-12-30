var db          = require('../db')
  , Utils       = require('../utils');

function AirportCreator(airport, city) {
	if(!airport.name) throw "name attribute of airport missing";
	if(!airport.code) throw "code attribute of airport missing";
	if(!airport.latitude) throw "latitude attribute of airport missing";
	if(!airport.longitude) throw "longitude attribute of airport missing";
    
    this.airport = db.Airport.build(airport, ['name', 'code', 'latitude', 'longitude']);
    db.applyLater(this.airport, 'save');
    
    this.city = city;
    print("Airport " + airport.name + " created in " + city.city.name);
};

AirportCreator.prototype.Airport = function(args) {
    return this.city.Airport(args);
}

AirportCreator.prototype.City = function(args) {
    return this.city.City(args);
}

AirportCreator.prototype.finishLine = function() {
    this.city.finishLine();
}

function CityCreator(city, country) {
	if(!city.name) throw "name attribute of city missing";

    this.city = db.City.build(city, ['name']);
    db.applyLater(this.city, 'save');
    
    this.country = country;
    this.airports = [];
    print("City " + city.name + " created in " + country.country.name);
}

CityCreator.prototype.Airport = function(args) {
    var airport = new AirportCreator(args, this);
    
    this.airports.push(airport);
    //db.applyLater(this.city, 'addAirport', airport.airport);
    
    return airport;
}

CityCreator.prototype.City = function(args) {
    return this.country.City(args);
}

CityCreator.prototype.finishLine = function() {
    this.country.finishLine();
}

function CountryCreator(country) {
	if(!country.name) throw "name attribute of country missing";
	if(!country.code) throw "code attribute of country missing";
    
    this.country = db.Country.build(country, ['name', 'code']);
    
    db.applyLater(this.country, 'save');
    
    this.cities = [];
    print("Country " + country.name + " created");
}

CountryCreator.prototype.City = function(args) {
    var city = new CityCreator(args, this);
    this.cities.push(city);
    //db.applyLater(this.country, 'addCity', city.city);
    return city;
}

CountryCreator.prototype.finishLine = function(args) {
    var cityDOs = this.cities.map(
        function(e) {
            return e.city;
        }
    )
    
    db.applyLater(this.country, 'setCities', [cityDOs]);
    
    this.cities.forEach(
        function(city) {
            var airportDOs = city.airports.map(
                function(a) {
                    return a.airport;
                }
            );
            
            db.applyLater(city.city, 'setAirports', [airportDOs]);
        }
    );
}

exports.Country = function(args) {
	return new CountryCreator(args);
};
