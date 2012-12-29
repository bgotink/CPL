#!/usr/local/bin/node
var fs        = require('fs')
  , db        = require('./db')
  , scope     = require('./scope')
  , Sequelize = require('sequelize');

if (typeof print === 'undefined') {
  print = console.log;
}

var DSLRunner = (function(sc){
  var prepareFunctionBody = function(fn) {
    return '(' + fn.toString().replace(/\s+$/, '') + ')()';
  };
  
  var map = function(array, fn) {
      var ret = [];
      array.forEach(function(e) { ret.push(fn(e)); });
      return ret;
  };
  
  return function(callback) {
      var fArgs = Object.keys(sc), 
          f     = new Function(fArgs.join(', '), callback);
      //print("f: " + f.toString());
      return f.apply(sc, map(fArgs, function(a) { return sc[a]; }));
  };
})(scope);

if (process.argv.length < 2) {
    print("Error: please provide an argument");
}

// Initialize the database
db.sync().success(function() {
    console.log('Database Schema successfully synced.');

    // Unleash the beast!
    DSLRunner(
        fs.readFileSync(process.argv[2]).toString()
            .replace(/{/g, '({')
            .replace(/}/g, '})')
            .replace(/\)(\s*[^\s.])/g, ');$1')
            .replace(/\)\s*$/, ');')
    );
    
    print("Storing all entries");
    db.chain
        .runSerially({skipOnError: true})
        .success(function() {
            print("Succesfully stored all entries in file " + process.argv[2]);
        })
        .error(print);
}).error(function(error) {
    console.log('Database Schema synchronization failed (' + error + ').');
});