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

var oldToString = Object.prototype.toString;
Object.prototype.toString = function () {
    return '[' + Object.keys(this).join(', ') + ']';
}

var DSLRunner = (function(sc){
  var prepareFunctionBody = function(fn) {
    return '(' + fn.toString().replace(/\s+$/, '') + ')()';
  };
  
  return function(callback) {
      var fArgs = Object.keys(sc)
        , f     = new Function(fArgs.join(', '), callback);
      print("f: " + f.toString());
      return f.apply(sc, fArgs.map(function(a) { return sc[a]; }));
  };
})(scope);

if (process.argv.length < 2) {
    print("Error: please provide an argument");
}

// Initialize the database
db.sync().success(function() {
    print('Database Schema successfully synced.');

    // Unleash the beast!
    var start = +new Date;
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
    db.runAll().success(
        function() {
            print("Successfully stored in db in " + ((+new Date) - start) + "ms");
        }
    ).error(print);
}).error(function(error) {
    console.log('Database Schema synchronization failed (' + error + ').');
});