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

AirportCreator.prototype.checkDO = function(airport) {
    if (airport.code && airport.code !== this.airport.code) {
        throw "Airport codes don't match";
    }
    if (airport.name && airport.name !== this.airport.name) {
        throw "Airport names don't match for code " + this.airport.code;
    }
    if (airport.latitude && airport.latitude !== this.airport.latitude) {
        throw "Airport latitudes don't match for code " + this.airport.code;
    }
    if (airport.longitue && airport.longitude !== this.airport.longitude) {
        throw "Airport longitudes don't match for code " + this.airport.code;
    }
}

function CityCreator(city, country) {
	if(!city.name) throw "name attribute of city missing";

    if (city.id) {
        this.city = city;
        this._changed = false;
        print("City " + city.name + " loaded from database");
    } else {
        this.city = db.City.build(city, ['name']);
        db.applyLater(this.city, 'save', []);
        this._changed = true;
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
    var airport;
    
    airport = this.getAirport(args);
    if (airport) {
        airport.checkDO(args);
        return airport;
    }
    
    airport = new AirportCreator(args, this);
    this.airports.push(airport);

    this._changed |= !(args.CityId && args.CityId === this.city.id);
    
    return airport;
}

CityCreator.prototype.City = function(args) {
    return this.country.City(args);
}

CityCreator.prototype.finishLine = function() {
    this.country.finishLine();
}

CityCreator.prototype.store = function() {
    if (this._changed) {
        this.airports.store();
    }
}

CityCreator.prototype.getAirport = function(code) {
    return this.airports.get(code);
}

CityCreator.prototype.getDO = function() {
    return this.city;
}

CityCreator.prototype.checkDO = function (args) {
    if (args.name !== this.city.name) {
        throw "City name doesn't match";
    }
}

function CountryCreator(country) {
	if(!country.name) throw "name attribute of country missing";
	if(!country.code) throw "code attribute of country missing";
    
    if (country.id) {
        this.country = country;
        this._changed = false;
        print("Country " + country.name + " loaded from database");
    } else {
        this.country = db.Country.build(country, ['name', 'code']);
        db.applyLater(this.country, 'save', []);
        this._changed = true;
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
    var city;
    
    city = this.getCity(args);
    if (city) {
        city.checkDO(args);
        return city;
    }
    
    city = new CityCreator(args, this);
    this.cities.push(city);

    this._changed |= !(args.CountryId && args.CountryId === this.country.id);

    return city;
}

CountryCreator.prototype.getCity = function (obj) {
    return this.cities.get(obj);
}

CountryCreator.prototype.finishLine = function(args) {
    if (this._changed) {
        this.cities.store();
    }
    
    this.cities.forEach(
        function(city) {
            city.store();
        }
    );
}

CountryCreator.prototype.getDO = function() {
    return this.country;
}

CountryCreator.prototype.checkDO = function(country) {
    if (country.code && country.code !== this.country.code) {
        throw "Country codes don't match";
    }
    if (country.name && country.name !== this.country.name) {
        throw "Names don't match for country code " + this.country.code;
    }
}

var countries = new Utils.MultiIndexedSet(['code', 'name']);
var airports = new Utils.MultiIndexedSet(['code']);

exports.Country = function(args) {
    var country = countries.get(args);
    if (country) {
        country.checkDO(args);
        return country;
    }
	return new CountryCreator(args);
};

exports.Country.get = function(args) {
    return countries.get(args);
}

exports.Airport = function(args) {
    return airports.get(args);
}
