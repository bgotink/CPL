#!/usr/local/bin/node
var fs        = require('fs')
  , db        = require('./db')
  , scope     = require('./scope')
  , Sequelize = require('sequelize')
  , Utils     = require('./utils');

if (typeof print === 'undefined') {
  print = console.log;
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

Object.prototype.toString = function () {
    return '[' + Object.keys(this).join(', ') + ']';
}

var DSLRunner = function(callback) {
    var fArgs = Object.keys(scope)
      , f     = new Function(fArgs.join(', '), callback);
    
    //print("f: " + f.toString());
    return f.apply(
        null,
        fArgs.map(
            function(a) {
                return scope[a];
            }
        )
    );
};

if (process.argv.length < 2) {
    print("Error: please provide an argument");
}

var execChainer = new Utils.Chainer(false);

// synchronize the database
execChainer.applyLater(db, 'sync');

// Load the database
var tmp = {};
execChainer.applyLater(null, function () {
    print('Database Schema successfully synced.');
    return db.Country.findAll();
});
execChainer.applyLater(null, function (c) {
    print('Found ' + c.length + ' countries in the database');
    tmp.countries = {};
    c.forEach(function(country) {
        tmp.countries[country.id] = scope.Country(country);
    });
    return db.City.findAll();
});
execChainer.applyLater(null, function (c) {
    print('Found ' + c.length + ' cities in the database');
    tmp.cities = {};
    c.forEach(function(city) {
        var country = tmp.countries[city.CountryId];
        tmp.cities[city.id] = country.City(city);
    });
    delete tmp['countries'];
    return db.Airport.findAll();
});
execChainer.applyLater(null, function (a) {
    print('Found ' + a.length + ' airports in the database');
    tmp.airports = {};
    a.forEach(function (airport) {
        var city = tmp.cities[airport.CityId];
        tmp.airports[airport.id] = city.Airport(airport);
    });
    delete tmp['cities'];
    return db.AircraftModel.findAll();
});
execChainer.applyLater(null, function (a) {
    print('Found ' + a.length + ' aircraft models in the database');
    tmp.aircraftModels = {};
    a.forEach(function (model) {
        tmp.aircraftModels[model.id] = scope.AircraftModel(model);
    });
    return db.Airline.findAll();
});
execChainer.applyLater(null, function (a) {
    print('Found ' + a.length + ' airlines in the database');
    tmp.airlines = {};
    a.forEach(function (airline) {
        tmp.airlines[airline.id] = scope.Airline(airline);
    });
    return db.AircraftLayout.findAll();
});
execChainer.applyLater(null, function (l) {
    print('Found ' + l.length + ' aircraft layouts in the database');
    tmp.aircraftLayouts = {};
    l.forEach(function (layout) {
        var airline = tmp.airlines[layout.AirlineId];
        var model = tmp.aircraftModels[layout.AircraftModelId];
        tmp.aircraftLayouts[layout.id] = airline.Layout(layout, model);
    });
    return db.SeatClass.findAll();
});
execChainer.applyLater(null, function (s) {
    print('Found ' + s.length + ' seat classes in the database');
    tmp.seatClasses = {};
    s.forEach(function (seatClass) {
        var layout = tmp.aircraftLayouts[seatClass.AircraftLayoutId];
        tmp.seatClasses[seatClass.id] = layout.SeatClass(seatClass);
    });
    return db.Seat.findAll();
});
execChainer.applyLater(null, function (s) {
    print('Found ' + s.length + ' seats in the database');
    tmp.seats = {};
    s.forEach(function (seat) {
        var seatClass = tmp.seatClasses[seat.SeatClassId];
        tmp.seats[seat.id] = seatClass.Seat(seat);
    });
    return db.FlightDescription.findAll();
});
execChainer.applyLater(null, function (flightDesc) {
    print('Found ' + flightDesc.length + ' flight descriptions in the database');
    tmp.flightDescriptions = {};
    flightDesc.forEach(function (description) {
        var from    = tmp.airports[description.FromId]
          , to      = tmp.airports[description.ToId]
          , layout  = tmp.aircraftLayouts[description.AircraftLayoutId]
          , airline = tmp.airlines[layout.getDO().AirlineId];
        tmp.flightDescriptions[description.id]
                        = scope.FlightDescription(description, from, to, airline, layout);
    });
    return db.FlightDescriptionPeriod.findAll();
});
execChainer.applyLater(null, function (periods) {
    print('Found ' + periods.length + ' flight description periods in the database');
    tmp.flightDescriptionPeriods = {};
    periods.forEach(function (period) {
        var description = tmp.flightDescriptions[period.FlightDescriptionId];
        tmp.flightDescriptionPeriods[period.id] = description.Period(period);
    });
    return db.DateException.findAll();
});
execChainer.applyLater(null, function (dateExceptions) {
    print('Found ' + dateExceptions.length + ' date exceptions in the database');
    dateExceptions.forEach(function (dateException) {
        var period = tmp.flightDescriptionPeriods[dateException.FlightDescriptionPeriodId];
        period.DateException(dateException);
    });
    return db.Price.findAll();
});
execChainer.applyLater(null, function (prices) {
    print('Found ' + prices.length + ' prices in the database');
    prices.forEach(function (price) {
        var period = tmp.flightDescriptionPeriods[price.FlightDescriptionPeriodId]
          , seatClass = tmp.seatClasses[price.SeatClassId];
        period.Price(price, seatClass);
    });
    return db.Flight.findAll();
});

// Execute the DSL
var start;
execChainer.applyLater(null, function() {
    // Unleash the beast!
    start = +new Date;
    DSLRunner(
        fs.readFileSync(process.argv[2]).toString()
            .replace(/{/g, '({')
            .replace(/}/g, '})')
            .replace(/}\)(\s*[^\s.])/g, '}).finishLine();$1')
            .replace(/}\)\s*$/, '}).finishLine();')
    );
    print("Created structure in " + ((+new Date) - start) + 'ms');
    start = +new Date;
    
    print("Storing all entries");
    return db.runAll();
});

// Run, Forrest, Run!
execChainer.runAll().success(function() {
    print("Successfully stored everything in de db in " + ((+new Date) - start) + "ms");
}).error(function(error) {
    print('Database Schema synchronization failed (' + error + ').');
});