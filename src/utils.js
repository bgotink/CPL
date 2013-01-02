/*
 * MultiIndexedSet
 */
 
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

/*
 * DBCollection
 */
 
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