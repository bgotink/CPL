#!/usr/local/bin/node
//var Sequelize = require("sequelize");
var fs    = require('fs')
  , db    = require('./db')
  , scope = require('./scope');

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
      print("f: " + f.toString());
      return f.apply(sc, map(fArgs, function(a) { return sc[a]; }));
  };
})(scope);

if (process.argv.length < 2) {
    print("Error: please provide an argument");
}

DSLRunner(
    fs.readFileSync(process.argv[2]).toString()
        .replace(/{/g, '({')
        .replace(/}/g, '})')
        .replace(/\)(\s*[^\s.])/g, ');$1')
        .replace(/\)\s*$/, ');')
);

