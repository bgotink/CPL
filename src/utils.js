/*************************
 **** MultiIndexedSet ****
 *************************/
 
var MultiIndexedSet = function(indices) {
    this.indices = indices;
    this.values = {};
    this._v = [];
    
    var self = this;
    indices.forEach(
        function(e) {
            self.values[e] = [];
        }
    );
}

MultiIndexedSet.prototype.add = function(obj) {
    var self = this
      , objDO = obj.getDO ? obj.getDO() : obj;
    this.indices.forEach(
        function(idx) {
            if (typeof objDO[idx] === "undefined") {
                throw "index " + idx + " of object not set";
            }
            if (typeof self.values[idx][objDO[idx]] !== "undefined") {
                throw "collection already contains an object where " + idx + " = " + objDO[idx];
            }
            
            self.values[idx][objDO[idx]] = obj;
        }
    );
    self._v.push(obj);
}

MultiIndexedSet.prototype.push = MultiIndexedSet.prototype.add;

MultiIndexedSet.prototype.get = function(obj) {
    var self = this;
    var found = false;
    this.indices.forEach(
        function(idx) {
            if (found !== false) return;

            if (typeof obj[idx] !== "undefined") {
                found = self.values[idx][obj[idx]];
            }
        }
    );
    return found === false ? undefined : found;
}

MultiIndexedSet.prototype.forEach = function(fun) {
    this._v.forEach(fun);
}

module.exports.MultiIndexedSet = MultiIndexedSet;

/**********************
 **** DBCollection ****
 **********************/
 
var DBCollection = function (rootObj, setFunc, applyLater, indices) {
    MultiIndexedSet.call(this, indices);
    
    this.setFunc = setFunc;
    this.rootObj = rootObj;
    this.collection = {};
    
    this.applyLater = applyLater;
}

DBCollection.prototype.add = MultiIndexedSet.prototype.add;
DBCollection.prototype.push = MultiIndexedSet.prototype.push;
DBCollection.prototype.get = MultiIndexedSet.prototype.get;
DBCollection.prototype.forEach = MultiIndexedSet.prototype.forEach;

DBCollection.prototype.store = function () {
    var self = this;
    var collectionDOs = this._v.map(
        function (k) {
            return k.getDO();
        }
    );
    
    this.applyLater(this.rootObj, this.setFunc, [collectionDOs]);
}

module.exports.DBCollection = DBCollection;

/*****************
 **** Chainer ****
 *****************/

var Chainer = function (debug) {
    this.todo = [];
    this.debug = !!debug;
}

var Sequelize = require('sequelize');

Chainer.prototype.applyLater = function(obj, func, params) {
    if (params && !Array.isArray(params))
        params = [params];
    this.todo.push({ obj: obj, func: func, params: params});
}

Chainer.prototype.runAll = function() {
    var _chain = this.todo.reverse();
    this.todo = [];
    
    var start = +new Date, prev = start;
    var i = 0, debug = this.debug;
    
    var exec = function() {
        var func = _chain.pop();
        if (debug) {
            if (i % 100 == 0) {
                var now = +new Date;
                print("" + i + "\t: " + (now - start) + "ms"
                            + "\tdiff:" + (now - prev) + "ms");
                prev = now;
            }
            ++i;
        }
        
        if (func) {
            var toCall;
            if (func.obj) {
                if (typeof func.func !== "function") {
                    toCall = func.obj[func.func];
                } else {
                    toCall = func.func;
                }
            } else {
                toCall = func.func;
            }
            
            var params;
            if (func.params) {
                params = func.params;
            } else {
                params = arguments;
            }
            
            toCall.apply(func.obj, params).success(
                function() {
                    exec.apply(null, arguments);
                }
            ).error(
                function(e) {
                    eventEmitter.emit('error', e);
                }
            )
        } else {
            eventEmitter.emit('success');
        }
    }
    
    var eventEmitter = new Sequelize.Utils.CustomEventEmitter(exec);
    return eventEmitter.run();
}

module.exports.Chainer = Chainer;

/***************************
 **** DatePatternParser ****
 ***************************/

var DatePatternParser = function (string) {
	var partsOfStr = string.replace(/,\s+/g, ',')
		.toLowerCase().split(',');
	print(partsOfStr);
	var monday = 0;
	var tuesday = 0;
	var wednesday = 0;
	var thursday = 0;
	var friday = 0;
	var saturday = 0;
	var sunday = 0;
	partsOfStr.forEach(function(part) {
    	switch (part) {
			case "mon":
			case "monday":
				monday = 1;
				break;
			case "tue":
			case "tuesday":
				tuesday = 1;
				break;
			case "wed":
			case "wednesday":
				wednesday = 1;
				break;
			case "thu":
			case "thursday":
				thursday = 1;
				break;
			case "fri":
			case "friday":
				friday = 1;
				break;
			case "sat":
			case "saturday":
				saturday = 1;
				break;
			case "sun":
			case "sunday":
				sunday = 1;
				break;
		}
	});
	print(	"Mon: " + monday + 
			", Tue: " + tuesday +
			", Wed: " + wednesday +
			", Thu: " + thursday +
			", Fri: " + friday +
			", Sat: " + saturday +
			", Sun: " + sunday);
	var result = (1 << 0)*monday
				 + (1 << 1)*tuesday
				 + (1 << 2)*wednesday
				 + (1 << 3)*thursday
				 + (1 << 4)*friday
				 + (1 << 5)*saturday
				 + (1 << 6)*sunday;
	return result;
}

module.exports.DatePatternParser = DatePatternParser;
