var db          = require('../db')
  , Utils       = require('../utils');

function AirportCreator(airport, city) {
	if(!airport.name) throw "name attribute of airport missing";
	if(!airport.code) throw "code attribute of airport missing";
	if(!airport.latitude) throw "latitude attribute of airport missing";
	if(!airport.longitude) throw "longitude attribute of airport missing";
    
    if (airport.id) {
        this.airport = airport;
        print("Airport " + airport.name + " loaded from database");
    } else {
        this.airport = db.Airport.build(airport, ['name', 'code', 'latitude', 'longitude']);
        db.applyLater(this.airport, 'save', []);
        print("Airport " + airport.name + " created in " + city.city.name);
    }
    
    this.city = city;
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

AirportCreator.prototype.getDO = function () {
    return this.airport;
}

function CityCreator(city, country) {
	if(!city.name) throw "name attribute of city missing";

    if (city.id) {
        this.city = city;
        print("City " + city.name + " loaded from database");
    } else {
        this.city = db.City.build(city, ['name']);
        db.applyLater(this.city, 'save', []);
        print("City " + city.name + " created in " + country.country.name);
    }
    
    this.country = country;
    this.airports = new Utils.DBCollection(
        this.city,
        'setAirports',
        db.applyLater,
        ['code', 'name']
    );
    
    var self = this;
    this.Airport.get = function (code) {
        return self.getAirport(code);
    }
}

CityCreator.prototype.Airport = function(args) {
    var airport = new AirportCreator(args, this);
    
    this.airports.push(airport);
    
    return airport;
}

CityCreator.prototype.City = function(args) {
    return this.country.City(args);
}

CityCreator.prototype.finishLine = function() {
    this.country.finishLine();
}

CityCreator.prototype.store = function() {
    this.airports.store();
}

CityCreator.prototype.getAirport = function(code) {
    return this.airports.get(code);
}

CityCreator.prototype.getDO = function() {
    return this.city;
}

function CountryCreator(country) {
	if(!country.name) throw "name attribute of country missing";
	if(!country.code) throw "code attribute of country missing";
    
    if (country.id) {
        this.country = country;
        print("Country " + country.name + " loaded from database");
    } else {
        this.country = db.Country.build(country, ['name', 'code']);
        db.applyLater(this.country, 'save', []);
        print("Country " + country.name + " created");
    }
    countries.push(this);
    
    this.cities = new Utils.DBCollection(
        this.country,
        'setCities',
        db.applyLater,
        ['name']
    );
    
    var self = this;
    this.City.get = function (obj) {
        return self.getCity(obj);
    }
}

CountryCreator.prototype.City = function(args) {
    var city = new CityCreator(args, this);
    this.cities.push(city);
    //db.applyLater(this.country, 'addCity', city.city);
    return city;
}

CountryCreator.prototype.getCity = function (obj) {
    return this.cities.get(obj);
}

CountryCreator.prototype.finishLine = function(args) {
    this.cities.store();
    
    this.cities.forEach(
        function(city) {
            city.store();
        }
    );
}

CountryCreator.prototype.getDO = function() {
    return this.country;
}

var countries = new Utils.MultiIndexedSet(['code', 'name']);


exports.Country = function(args) {
	return new CountryCreator(args);
};

exports.Country.get = function(obj) {
    return countries.get(obj);
}
