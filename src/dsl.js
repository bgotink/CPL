#!/usr/local/bin/node
var fs        = require('fs')
  , db        = require('./db')
  , scope     = require('./scope')
  , Sequelize = require('sequelize')
  , Utils     = require('./utils')
  , Log       = require('./log')
  , vm        = require('vm');

if (typeof print === 'undefined') {
  print = Log.debug;
}

Object.defineProperty(
    Object.prototype,
    "finishLine",
    {
        enumerable: false,
        writable: true,
        configurable: false,
        value: function() {}
    }
);

var DSLRunner = function(filename) {
    var code = fs.readFileSync(filename).toString()
            // add parentheses around {...}
            .replace(/{/g, '({')
            .replace(/}/g, '})')
            // append a finishLine to every line ending,
            // that is, a '})' followed by a '.'
            .replace(/}\)(\s*[^\s.])/g, '}).finishLine();$1')
            .replace(/}\)\s*$/, '}).finishLine();');

    return vm.runInNewContext(
        code,
        scope,
        filename
    );
};

if (process.argv.length < 2) {
    Log.error("Error: please provide an argument");
    process.exit(1);
}

var execChainer = new Utils.Chainer(false);

// synchronize the database
execChainer.applyLater(db, 'sync');

// Load the database
var tmp = {};
execChainer.applyLater(null, function () {
    Log.info('Database Schema successfully synced.');
    return db.Country.findAll();
});
execChainer.applyLater(null, function (c) {
    Log.info('Found ' + c.length + ' countries in the database');
    tmp.countries = {};
    c.forEach(function(country) {
        tmp.countries[country.id] = scope.Country(country);
    });
    return db.City.findAll();
});
execChainer.applyLater(null, function (c) {
    Log.info('Found ' + c.length + ' cities in the database');
    tmp.cities = {};
    c.forEach(function(city) {
        var country = tmp.countries[city.CountryId];
        tmp.cities[city.id] = country.City(city);
    });
    delete tmp['countries'];
    return db.Airport.findAll();
});
execChainer.applyLater(null, function (a) {
    Log.info('Found ' + a.length + ' airports in the database');
    tmp.airports = {};
    a.forEach(function (airport) {
        var city = tmp.cities[airport.CityId];
        tmp.airports[airport.id] = city.Airport(airport);
    });
    delete tmp['cities'];
    return db.AircraftModel.findAll();
});
execChainer.applyLater(null, function (a) {
    Log.info('Found ' + a.length + ' aircraft models in the database');
    tmp.aircraftModels = {};
    a.forEach(function (model) {
        tmp.aircraftModels[model.id] = scope.AircraftModel(model);
    });
    return db.Airline.findAll();
});
execChainer.applyLater(null, function (a) {
    Log.info('Found ' + a.length + ' airlines in the database');
    tmp.airlines = {};
    a.forEach(function (airline) {
        tmp.airlines[airline.id] = scope.Airline(airline);
    });
    return db.AircraftLayout.findAll();
});
execChainer.applyLater(null, function (l) {
    Log.info('Found ' + l.length + ' aircraft layouts in the database');
    tmp.aircraftLayouts = {};
    l.forEach(function (layout) {
        var airline = tmp.airlines[layout.AirlineId];
        var model = tmp.aircraftModels[layout.AircraftModelId];
        tmp.aircraftLayouts[layout.id] = airline.Layout(layout, model);
    });
    return db.SeatClass.findAll();
});
execChainer.applyLater(null, function (s) {
    Log.info('Found ' + s.length + ' seat classes in the database');
    tmp.seatClasses = {};
    s.forEach(function (seatClass) {
        var layout = tmp.aircraftLayouts[seatClass.AircraftLayoutId];
        tmp.seatClasses[seatClass.id] = layout.SeatClass(seatClass);
    });
    return db.Seat.findAll();
});
execChainer.applyLater(null, function (s) {
    Log.info('Found ' + s.length + ' seats in the database');
    tmp.seats = {};
    s.forEach(function (seat) {
        var seatClass = tmp.seatClasses[seat.SeatClassId];
        tmp.seats[seat.id] = seatClass.Seat(seat);
    });
    return db.FlightDescription.findAll();
});
execChainer.applyLater(null, function (flightDesc) {
    Log.info('Found ' + flightDesc.length + ' flight descriptions in the database');
    tmp.flightDescriptions = {};
    flightDesc.forEach(function (description) {
        var from    = tmp.airports[description.FromId]
          , to      = tmp.airports[description.ToId]
          , airline = tmp.airlines[description.AirlineId];
        tmp.flightDescriptions[description.id]
                        = scope.FlightDescription(description, from, to, airline);
    });
    return db.FlightDescriptionPeriod.findAll();
});
execChainer.applyLater(null, function (periods) {
    Log.info('Found ' + periods.length + ' flight description periods in the database');
    tmp.flightDescriptionPeriods = {};
    periods.forEach(function (period) {
        var description = tmp.flightDescriptions[period.FlightDescriptionId]
          , layout = tmp.aircraftLayouts[period.AircraftLayoutId];
        tmp.flightDescriptionPeriods[period.id] = description.Period(period, layout);
    });
    return db.DateException.findAll();
});
execChainer.applyLater(null, function (dateExceptions) {
    Log.info('Found ' + dateExceptions.length + ' date exceptions in the database');
    dateExceptions.forEach(function (dateException) {
        var period = tmp.flightDescriptionPeriods[dateException.FlightDescriptionPeriodId];
        period.DateException(dateException);
    });
    return db.Price.findAll();
});
execChainer.applyLater(null, function (prices) {
    Log.info('Found ' + prices.length + ' prices in the database');
    prices.forEach(function (price) {
        var period = tmp.flightDescriptionPeriods[price.FlightDescriptionPeriodId]
          , seatClass = tmp.seatClasses[price.SeatClassId];
        period.Price(price, seatClass);
    });
    return db.Flight.findAll();
});

var start;
execChainer.applyLater(null, function(flights) {
    // first store the flights
    Log.info('Found ' + flights.length + ' flights in the database');
    flights.forEach(function (flight) {
        var period = tmp.flightDescriptionPeriods[flight.FlightDescriptionPeriodId];
        period._Flight(flight);
    });
    
    // Check validity of _ALL_ flightDescriptionPeriods
    Object.keys(tmp.flightDescriptions).forEach(function (descId) {
        tmp.flightDescriptions[descId].finishLine();
    });
    
    // Unleash the beast!
    start = +new Date;
    DSLRunner(
        process.argv[2]
    );
    Log.info("Created structure in " + ((+new Date) - start) + 'ms');
    start = +new Date;
    
    Log.info("Storing all entries");
    return db.runAll();
});

// Run, Forrest, Run!
execChainer.runAll().success(function() {
    Log.info("Successfully stored everything in de db in " + ((+new Date) - start) + "ms");
}).error(function(error) {
    Log.error("An error occured during execution:");
    var stack = error.stack.split(/\n/);

    Log.error(stack[0]);
    stack.splice(0, 1);

    stack.forEach(
        function (line) {
            if (line.match(/\.dsl:/)) {
                Log.error(line.replace(/:(\d+):\d+/, ':$1'));
            } else {
                Log.debug(line);
            }
        }
    );
});