var Sequelize   = require('sequelize')
  , db          = require('../db');

var AirlineCreator = function(airline) {
	if(!airline.name) throw "name attribute of airline missing";
	if(!airline.code) throw "code attribute of airline missing";

    this.airline = db.Airline.build(airline, ['name', 'code']);
    
    db.applyLater(this.airline, 'save');
    
    print("Airline with name: " + airline.name + " and code: " + airline.code + " created");
}

exports.Airline = function(args) {
	return new AirlineCreator(args);
};
