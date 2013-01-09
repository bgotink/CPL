var Sequelize   = require('sequelize')
  , FileSystem  = require('fs')
  , Path        = require('path')
  , Utils       = require('./utils')
  , sequelize   = require('./config');

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
        unique: true,
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
    },
    timezone: {
        type: Sequelize.STRING,
        validate: {
            isAlpha: true,
            is: [ ["[a-z]+/[a-z]+", "i"] ]
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
    code: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
            is: ["[A-Z]{4}"]
        }
    },
    latitude: {
        type: Sequelize.FLOAT,
        validate: {
            // Geen idee of dit automatisch gaat voor float types...
            isFloat: true,
            isEmpty: true
        }
    },
    longitude: {
        type: Sequelize.FLOAT,
        validate: {
            // Geen idee of dit automatisch gaat voor float types...
            isFloat: true,
            isEmpty: true
        }
    }
    // City, see "ASSOCIATIONS" block
	// Departures, see "ASSOCIATIONS" block
	// Arrivals, see "ASSOCIATIONS" block
});

/*******************
 ****  AIRLINE  ****
 *******************/

var Airline = sequelize.define('Airline', {
    name: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    code: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
            is: ["[A-Z]{3}"]
        }
    }
	// AircraftLayouts, see "ASSOCIATIONS" block
});

/**************************
 ****  AircraftLayout  ****
 **************************/

var AircraftLayout = sequelize.define('AircraftLayout', {
    name: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    }
	// Airline, see "ASSOCIATIONS" block
	// AircraftModel, see "ASSOCIATIONS" block
	// FlightDescriptions, see "ASSOCIATIONS" block
	// SeatClasses, see "ASSOCIATIONS" block
});

/*******************
 **** SEATCLASS ****
 *******************/

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
	// AircraftLayout, see "ASSOCIATIONS" block
	// Seats, see "ASSOCIATIONS" block
	// Prices, see "ASSOCIATIONS" block
});

/************************
 ****  AIRCRAFTMODEL  ****
 ************************/

var AircraftModel = sequelize.define('AircraftModel', {
    manufacturer: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    name: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    code: {
        type: Sequelize.STRING,
		unique: true,
        validate: {
            is: ["[A-Z0-9-]*"]
        }
    }
	// AircraftLayouts, see "ASSOCIATIONS" block
});

/*******************
 ****   SEAT    ****
 *******************/

var Seat = sequelize.define('Seat', {
    row: {
        type: Sequelize.INTEGER,
        validate: {
            isInt: true,
            min: 0
        }
    },
    letter: {
        type: Sequelize.STRING,
        validate: {
            is: ["[A-Z]"]
        }
    }
	// SeatClass, see "ASSOCIATIONS" block
});

/*****************************
 ****  FLIGHTDESCRIPTION  ****
 *****************************/

var FlightDescription = sequelize.define('FlightDescription', {
    flightNumber: {
        type: Sequelize.INTEGER,
        validate: {
            isInt: true,
            min: 0
        }
    },
	distance: {
        type: Sequelize.FLOAT,
        validate: {
            isFloat: true,
            min: 0
        }
    },
    departureTime: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    },
	arrivalTime: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    }
    // Airline, see "ASSOCIATIONS" block
    // From, see "ASSOCIATIONS" block
    // To, see "ASSOCIATIONS" block
    // Periods, see "ASSOCIATIONS" block
});

/***********************************
 ****  FLIGHTDESCRIPTIONPERIOD  ****
 ***********************************/

var FlightDescriptionPeriod = sequelize.define('FlightDescriptionPeriod', {
    validFrom: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    },
    validTo: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    },
	datePattern: {
		type: Sequelize.INTEGER,
		validate: {
			isInt: true,
            min: 0
		}
	}
    // FlightDescription, see "ASSOCIATIONS" block
	// Flights, see "ASSOCIATIONS" block
	// DateExceptions, see "ASSOCIATIONS" block
	// Prices, see "ASSOCIATIONS" block
    // AircraftLayout, see "ASSOCIATIONS" block
});

/*************************
 ****  DATEEXCEPTION  ****
 *************************/

var DateException = sequelize.define('DateException', {
    date: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    }
	// FlightDescriptionPeriod, see "ASSOCIATIONS" block
});

/******************
 ****  FLIGHT  ****
 ******************/

var Flight = sequelize.define('Flight', {
    date: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    },
	actualDepartureTime: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    },
	actualArrivalTime: {
        type: Sequelize.DATE,
        validate: {
            isDate: true
        }
    }
	// FlightDescriptionPeriod, see "ASSOCIATIONS" block
});

/*****************
 ****  PRICE  ****
 *****************/

var Price = sequelize.define('Price', {
    price: {
        type: Sequelize.FLOAT,
        validate: {
            isFloat: true,
            min: 0
        }
    },
    currency: {
        type: Sequelize.STRING,
        validate: {
            isAlpha: true
        }
    }
	// FlightDescriptionPeriod, see "ASSOCIATIONS" block
	// SeatClass, see "ASSOCIATIONS" block
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
 * Will create  Airline::getAircraftLayouts(),
 *              Airline::setAircraftLayouts(),
 *              Airline::addAircraftLayout(),
 *              Airline::removeAircraftLayout()
 */
Airline.hasMany(AircraftLayout);

/*
 * Will create  Airline::getFlightDescriptions(),
 *              Airline::setFlightDescriptions(),
 *              Airline::addFlightDescription(),
 *              Airline::removeFlightDescription()
 */
Airline.hasMany(FlightDescription);
FlightDescription.belongsTo(Airline);

/*
 * Will create  AircraftModel::getAircraftLayouts(),
 *              AircraftModel::setAircraftLayouts(),
 *              AircraftModel::addAircraftLayout(),
 *              AircraftModel::removeAircraftLayout()
 */
AircraftModel.hasMany(AircraftLayout);

/*
 * Will create  AircraftLayout::getSeatClasses(),
 *              AircraftLayout::setSeatClasses(),
 *              AircraftLayout::addSeatClass(),
 *              AircraftLayout::removeSeatClass()
 */
AircraftLayout.hasMany(SeatClass);

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
 * Will create  Airport::getDepartures(),
 *              Airport::setDepartures(),
 *              Airport::addDeparture(),
 *              Airport::removeDeparture()
 */
Airport.hasMany(FlightDescription, {as: 'Departures', foreignKey: 'FromId'});
FlightDescription.belongsTo(Airport, {as: 'From', foreignKey: 'FromId'});

/*
 * Will create  Airport::getArrivals(),
 *              Airport::setArrivals(),
 *              Airport::addArrival(),
 *              Airport::removeArrival()
 */
Airport.hasMany(FlightDescription, {as: 'Arrivals', foreignKey: 'ToId'});
FlightDescription.belongsTo(Airport, {as: 'To', foreignKey: 'ToId'});

/*
 * Will create  AircraftLayout::getFlightDescriptionPeriods(),
 *              AircraftLayout::setFlightDescriptionPeriods(),
 *              AircraftLayout::addFlightDescriptionPeriod(),
 *              AircraftLayout::removeFlightDescriptionPeriod()
 */
AircraftLayout.hasMany(FlightDescriptionPeriod);
FlightDescriptionPeriod.belongsTo(AircraftLayout);

/*
 * Will create  FlightDescription::getFlights(),
 *              FlightDescription::setFlights(),
 *              FlightDescription::addFlight(),
 *              FlightDescription::removeFlight()
 */
FlightDescriptionPeriod.hasMany(Flight);

/*
 * Will create  FlightDescriptionPeriod::getPrices(),
 *              FlightDescriptionPeriod::setPrices(),
 *              FlightDescriptionPeriod::addPrice(),
 *              FlightDescriptionPeriod::removePrice()
 */
FlightDescriptionPeriod.hasMany(Price);

/*
 * Will create  FlightDescriptionPeriod::getDateExceptions(),
 *              FlightDescriptionPeriod::setDateExceptions(),
 *              FlightDescriptionPeriod::addDateException(),
 *              FlightDescriptionPeriod::removeDateException()
 */
FlightDescriptionPeriod.hasMany(DateException);

/*
 * Will create  SeatClass::getPrices(),
 *              SeatClass::setPrices(),
 *              SeatClass::addPrice(),
 *              SeatClass::removePrice()
 */
SeatClass.hasMany(Price);

module.exports = sequelize;

var Utils = require('./utils')
  , chain = new Utils.Chainer(true);
  
module.exports.applyLater = function(obj, func, params) {
    return chain.applyLater(obj, func, params);
}
module.exports.runAll = function() {
    return chain.runAll();
}

module.exports.Country = Country;
module.exports.City = City;
module.exports.Airport = Airport;
module.exports.Airline = Airline;
module.exports.AircraftModel = AircraftModel;
module.exports.AircraftLayout = AircraftLayout;
module.exports.Seat = Seat;
module.exports.SeatClass = SeatClass;
module.exports.FlightDescription = FlightDescription;
module.exports.FlightDescriptionPeriod = FlightDescriptionPeriod;
module.exports.Flight = Flight;
module.exports.Price = Price;
module.exports.DateException = DateException;
