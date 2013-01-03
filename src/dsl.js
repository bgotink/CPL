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

var DSLRunner = function(callback) {
    var fArgs = Object.keys(scope)
      , f     = new Function(fArgs.join(', '), callback);
    
    print("f: " + f.toString());
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
var countries, cities, airports
  , airlines, flights;
execChainer.applyLater(null, function () {
    print('Database Schema successfully synced.');
    return db.Country.findAll();
});
execChainer.applyLater(null, function (c) {
    print('Found ' + c.length + ' countries in the database');
    countries = c;
    return db.City.findAll();
});
execChainer.applyLater(null, function (c) {
    print('Found ' + c.length + ' cities in the database');
    cities = c;
    return db.Airport.findAll();
});
execChainer.applyLater(null, function (a) {
    print('Found ' + a.length + ' airports in the database');
    airports = a;
    return db.Airline.findAll();
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