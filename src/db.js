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
            is: ["[A-Z]{2}"]
        }
    }
    // Cities, see "ASSOCIATIONS" block
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
    // Country, see "ASSOCIATIONS" block
    // Airports, see "ASSOCIATIONS" block
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
            is: ["[A-Z]{3}"]
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
    // City, see "ASSOCIATIONS" block
});

var Airline = sequelize.define('Airline', {
    name: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    iata: {
        type: Sequelize.STRING,
        validate: {
            is: ["[A-Z]{2}"]
        }
    }
});

var SeatClass = sequelize.define('SeatClass', {
    name: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    code: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    }
});

var AircraftType = sequelize.define('AircraftType', {
    manufacturer: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    model: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    code: {
        type: Sequelize.STRING,
        validate: {
            is: ["[A-Z0-9-]*"]
        }
    }
});

var Seat = sequelize.define('Seat', {
    number: {
        type: Sequelize.INTEGER,
        validate: {
            isInt: true,
            min: 0
        }
    }
});

var FlightDescription = sequelize.define('FlightDescription', {
    number: {
        type: Sequelize.INTEGER,
        validate: {
            isInt: true,
            min: 0
        }
    }
    // From, see "ASSOCIATIONS" block
    // To, see "ASSOCIATIONS" block
    // Periods, see "ASSOCIATIONS" block
    // Airline, see "ASSOCIATIONS" block
});

var FlightDescriptionPeriod = sequelize.define('FlightDescriptionPeriod', {
    from: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    },
    to: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    }
    // TODO: Date Pattern
});

var Flight = sequelize.define('Flight', {
    date: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    }
});

var Price = sequelize.define('Price', {
    date: {
        type: Sequelize.FLOAT,
        validate: {
            isFloat: true,
            min: 0
        }
    }
});


/************************
 ****  ASSOCIATIONS  ****
 ************************/
/*
 * Will create  Country::getCities(),
 *              Country::setCities(),
 *              Country::addCity(),
 *              Country::removeCity()
 */
Country.hasMany(City);

/*
 * Will create  City::getAirports(),
 *              City::setAirports(),
 *              City::addAirport(),
 *              City::removeAirport()
 */
City.hasMany(Airport);

/*
 * Will create  AircraftType::getSeats(),
 *              AircraftType::setSeats(),
 *              AircraftType::addSeat(),
 *              AircraftType::removeSeat()
 */
AircraftType.hasMany(Seat);

/*
 * Will create  SeatClass::getSeats(),
 *              SeatClass::setSeats(),
 *              SeatClass::addSeat(),
 *              SeatClass::removeSeat()
 */
SeatClass.hasMany(Seat);

/*
 * Will create  FlightDescription::getPeriods(),
 *              FlightDescription::setPeriods(),
 *              FlightDescription::addPeriod(),
 *              FlightDescription::removePeriod()
 */
FlightDescription.hasMany(FlightDescriptionPeriod, {as: 'Periods'});

/*
 * Will create  Airline::getFlightDescriptions(),
 *              Airline::setFlightDescriptions(),
 *              Airline::addFlightDescription(),
 *              Airline::removeFlightDescription()
 */
Airline.hasMany(FlightDescription);

/*
 * Will create  Airport::getDepartures(),
 *              Airport::setDepartures(),
 *              Airport::addDeparture(),
 *              Airport::removeDeparture()
 */
Airport.hasMany(FlightDescription, {as: 'Departures', foreignKey: 'FromId'});

/*
 * Will create  Airport::getArrivals(),
 *              Airport::setArrivals(),
 *              Airport::addArrival(),
 *              Airport::removeArrival()
 */
Airport.hasMany(FlightDescription, {as: 'Arrivals', foreignKey: 'ToId'});

/*
 * Will create  FlightDescription::getFlights(),
 *              FlightDescription::setFlights(),
 *              FlightDescription::addFlight(),
 *              FlightDescription::removeFlight()
 */
FlightDescription.hasMany(Flight);

/*
 * Will create  FlightDescriptionPeriod::getPrices(),
 *              FlightDescriptionPeriod::setPrices(),
 *              FlightDescriptionPeriod::addPrice(),
 *              FlightDescriptionPeriod::removePrice()
 */
FlightDescriptionPeriod.hasMany(Price);

/*
 * Will create  SeatClass::getPrices(),
 *              SeatClass::setPrices(),
 *              SeatClass::addPrice(),
 *              SeatClass::removePrice()
 */
SeatClass.hasMany(Price);





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
module.exports.Airline = Airline;
module.exports.AircraftType = AircraftType;
module.exports.Seat = Seat;
module.exports.SeatClass = SeatClass;
module.exports.FlightDescription = FlightDescription;
module.exports.FlightDescriptionPeriod = FlightDescriptionPeriod;
module.exports.Flight = Flight;
module.exports.Price = Price;