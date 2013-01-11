var NodeUtil = require('util')
  , Errors   = require('./error')
  , Log      = require('./log');

if (!Array.prototype.contains) {
    Object.defineProperty(
        Array.prototype,
        "contains",
        {
            enumerable: false,
            writable: true,
            configurable: false,
            value: function(e) { return this.indexOf(e) !== -1; }
        }
    );
}

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
            if (typeof e === 'function') {
                e._idx_id = '__idx' + (++(self._idx_ids));
                self.values[e._idx_id] = [];
            } else {
                self.values[e] = [];
            }
        }
    );
}

MultiIndexedSet.prototype.push = 
MultiIndexedSet.prototype.add = function(obj) {
    var self = this
      , objDO = obj.getDO ? obj.getDO() : obj;
    this.indices.forEach(
        function(idx) {
            if (idx._idx_id) {
                var objIdx = idx.call(objDO, objDO);
                
                if (typeof objIdx === "undefined") {
                    throw new Errors.InvalidArgument("function index " + idx + " gives illegal result.");
                }
                if (typeof self.values[idx._idx_id][objIdx] !== "undefined") {
                    throw new Errors.Duplicate("set already contains an object where function index "
                        + idx + " = " + objIdx);
                }
                
                self.values[idx._idx_id][objIdx] = obj;
            } else {
                if (typeof objDO[idx] === "undefined") {
                    throw new Errors.InvalidArgument("index " + idx + " of object not set");
                }
                if (typeof self.values[idx][objDO[idx]] !== "undefined") {
                    throw new Errors.Duplicate("set already contains an object where " + idx + " = " + objDO[idx]);
                }
                
                self.values[idx][objDO[idx]] = obj;
            }
        }
    );
    self._v.push(obj);
}

MultiIndexedSet.prototype.get = function(obj) {
    var self = this;
    var found = false;
    this.indices.forEach(
        function(idx) {
            if (found !== false) return;

            if (idx._idx_id) {
                var objIdx = idx.call(obj, obj);
                if (typeof objIdx !== "undefined") {
                    found = self.values[idx._idx_id][objIdx];
                }
            } else {
                if (typeof obj[idx] !== "undefined") {
                    found = self.values[idx][obj[idx]];
                }
            }
        }
    );
    return found === false ? undefined : found;
}

MultiIndexedSet.prototype.forEach = function(fun) {
    this._v.forEach(fun);
}

MultiIndexedSet.prototype.map = function(fun) {
    return this._v.map(fun);
}

Object.defineProperty(
    MultiIndexedSet.prototype,
    "length",
    {
        enumerable: false,
        configurable: false,
        get: function(e) { return this._v.length; }
    }
);

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

NodeUtil.inherits(DBCollection, MultiIndexedSet);

DBCollection.prototype.store = function () {
    if (this.__stored) return;
    this.__stored = true;

    var self = this;
    this.applyLater(null, function() {
        var collectionDOs = self._v.map(
            function (k) {
                return k.getDO();
            }
        );
        
        self.__stored = false;
        return self.rootObj[self.setFunc](collectionDOs);
    });
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
            
            try {
                toCall.apply(func.obj, params).success(
                    function() {
                        exec.apply(null, arguments);
                    }
                ).error(
                    function(e) {
                        eventEmitter.emit('error', e);
                    }
                )
            } catch (e) {
                eventEmitter.emit('error', e);
            }
        } else {
            eventEmitter.emit('success');
        }
    }
    
    var eventEmitter = new Sequelize.Utils.CustomEventEmitter(exec);
    return eventEmitter.run();
}

module.exports.Chainer = Chainer;

/********************
 **** TimeParser ****
 ********************/
var __now = 0;
var TimeParser = function (string) {
    if (typeof string === 'string') {
        var parts = string.match(/^\s*(\d{1,2})[: .uh]?\s*(\d{2})m?\s*(\+\d)?\s*$/);
        if (parts.length === 0) {
            throw new Errors.InvalidArgument("Invalid date: " + string);
        }
        var date = new Date(__now);
        date.setHours(parts[1]);
        date.setMinutes(parts[2]);
        if (parts[3]) {
            var days = +(parts[3].replace(/^\+/, ''));
            if (days > 3) {
                throw new Errors.InvalidArgument("Flights can't take " + days + "days, fuel problems will ensue");
            }
            date.setDate(date.getDate() + days);
        }
        return date;    
    } else {
        var date = new Date(__now);
        date.setHours(string.getHours());
        date.setMinutes(string.getMinutes());
        date.setDate(string.getDate());
        return date;
    }
}

module.exports.parseTime = TimeParser;

/********************
 **** DateParser ****
 ********************/
var DateParser = function(str) {
    var date = new Date(str);
    if (date.toString() === 'Invalid Date') {
        throw new Errors.InvalidArgument("Invalid date: " + str);
    }
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
}

module.exports.parseDate = DateParser;

/***************************
 **** DatePatternParser ****
 ***************************/

var DatePatternParser = function (string) {
	var partsOfStr = string.replace(/\s*,\s*/g, ',')
		.toLowerCase().split(',');
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
            default:
                throw new Error.InvalidArgument("Unkonwn day of the week: " + part);
		}
	});
	var result = (1 << 0)*sunday
				 + (1 << 1)*monday
				 + (1 << 2)*tuesday
				 + (1 << 3)*wednesday
				 + (1 << 4)*thursday
				 + (1 << 5)*friday
				 + (1 << 6)*saturday;
	return result;
}

module.exports.parseDatePattern = DatePatternParser;

/****************************
 **** DatesBetweenExcept ****
 ****************************/

var DatesBetweenExcept = function(from, to, pattern, exceptions){
	if(from > to){
		throw new Error.InvalidArgument("from is later than to");
	}
    if (typeof pattern === 'string') {
        pattern = DatePatternParser(pattern);
    }
    
	var x = new Date(from);
	var result = [];
	while(x<to){
		if(checkWithPattern(x, pattern) && isNoException(x, exceptions)){
			result.push(new Date(x));
		}		
		x.setDate(x.getDate()+1);
	}
	return result;
}

var checkWithPattern = function(date, pattern){
	//getDay() method of date returns a value between 0 and 6, 0 being sunday
	var dayOfWeek = date.getDay();
	var check = (pattern >> dayOfWeek) & 1;
	//console.log("check " + dayOfWeek + ": " + check + "(" + (pattern >> dayOfWeek) + ")");
	if(check === 1){
		return true;
	} else{
		return false;
	}
}

var isNoException = function(date, exceptions){
	for(var i=0;i<exceptions.length;i++){
		if((date.getDate() === exceptions[i].getDate()) && 
			(date.getMonth() === exceptions[i].getMonth())){
			return false;
		}
	}
	return true;
}

module.exports.datesBetweenExcept = DatesBetweenExcept;

/*******************
 **** Validator ****
 *******************/

var Validator = function (obj, type) {
    var res = obj.getDO().validate();
    if (res === null) return;
    
    Object.keys(res).forEach(function (field) {
        var printedHeader = false;
        res[field].forEach(function (err) {
            if (err === '') return;
            
            if (!printedHeader) {
                printedHeader = true;
                Log.error("The following validations of attribute %s failed:", field);
            }
            
            Log.error("\t%s", err);
        });
    });
    throw new Errors.Validate("Validation of " + (type ? type : obj) + " failed");
}

module.exports.validate = Validator;
