var Sequelize = require('sequelize')
  , fs = require('fs');

var dbFile = __dirname + '/../data/db.sqlite';

var sequelize = new Sequelize('cpl', 'cpl', null, {
    dialect: 'sqlite',
    storage: dbFile,
    logging: false
});

/*******************
 ****  COUNTRY  ****
 *******************/
var Country = sequelize.define('Country', {
    name: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    code: {
        type: Sequelize.STRING,
        validate: {
            is: ["A-Z{2}"]
        }
    }
});

/****************
 ****  CITY  ****
 ****************/
var City = sequelize.define('City', {
    name: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    }
});

/*******************
 ****  AIRPORT  ****
 *******************/
var Airport = sequelize.define('Airport', {
    name: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    iata: {
        type: Sequelize.STRING,
        validate: {
            is: ["A-Z{3}"]
        }
    },
    latitude: {
        type: sequelize.FLOAT,
        validate: {
            // Geen idee of dit automatisch gaat voor float types...
            isFloat: true,
            isEmpty: true
        }
    },
    longitude: {
        type: sequelize.FLOAT,
        validate: {
            // Geen idee of dit automatisch gaat voor float types...
            isFloat: true,
            isEmpty: true
        }
    }
});

/************************
 ****  ASSOCIATIONS  ****
 ************************/
// Will create Country::getCities() and Country::setCities()
Country.hasMany(City, {as: 'Cities'});

// Will create City::getAirports() and Country::setAirports()
City.hasMany(Airport, {as: 'Airports'});


/***************************
 ****  SYNCHRONISATION  ****
 ***************************/
// sync with the actual database
sequelize.sync().success(function() {
    console.log('Database Schema successfully synced.');
}).error(function(error) {
    console.log('Database Schema synchronization failed (' + error + ').');
});

module.exports = sequelize;
module.exports.Country = Country;
module.exports.City = City;
module.exports.Airport = Airport;