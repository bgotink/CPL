var Sequelize   = require('sequelize')
  , db          = require('../db')
  , Utils       = require('../utils');

var AirlineCreator = function(airline) {
	if(!airline.name) throw "name attribute of airline missing";
	if(!airline.code) throw "code attribute of airline missing";

    this.airline = db.Airline.build(airline, ['name', 'code']);
    airlines.push(this);
    
    db.applyLater(this.airline, 'save');
    
    print("Airline with name: " + airline.name + " and code: " + airline.code + " created");
}

AirlineCreator.prototype.getDO = function () {
    return this.airline;
}

var airlines = new Utils.MultiIndexedSet(['code']);

exports.Airline = function(args) {
	return new AirlineCreator(args);
};

exports.Airline.get = function(args) {
    return airlines.get(args);
}