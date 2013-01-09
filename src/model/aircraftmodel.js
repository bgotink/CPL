var db      = require('../db')
  , Utils   = require('../utils')
  , Errors  = require('../error');

var AircraftModelCreator = function(args) {
    if (!args.manufacturer) throw new Errors.MissingAttribute("aircraft model manufacturer not set");
    if (!args.code) throw new Errors.MissingAttribute("aircraft model code not set");
    if (!args.name) throw new Errors.MissingAttribute("aircraft model name not set");
    
    if (args.id) {
        this.aircraftModel = args;
        this._changed = false;
        print("Aircraft model " + args.name + " loaded from db");
    } else {
        this.aircraftModel = db.AircraftModel.build(
            args,
            ['manufacturer', 'code', 'name']
        );
        db.applyLater(this.aircraftModel, 'save', []);
        this._changed = true;
        print("Aircraft model " + args.name + " created");
    }
    
    this.aircraftLayouts = new Utils.DBCollection(
        this.aircraftModel,
        'setAircraftLayouts',
        db.applyLater,
        []
    );
    this._lchanged = false;
    
    aircraftModels.push(this);
}

AircraftModelCreator.prototype.getDO = function () {
    return this.aircraftModel;
}

AircraftModelCreator.prototype.checkDO = function(args) {
    if (args.code !== this.aircraftModel.code) {
        throw new Errors.NoMatch("Aircraft model codes don't match");
    }
    if (args.name && args.name !== this.aircraftModel.name) {
        throw new Errors.NoMatch("Aircraft model names don't match for code " + args.code);
    }
    if (args.manufacturer && args.manufacturer !== this.aircraftModel.manufacturer) {
        throw new Errors.NoMatch("Aircraft model manufacturer doesn't match for code " + args.code);
    }
}

AircraftModelCreator.prototype._Layout = function(layout) {
    this.aircraftLayouts.push(layout);
    
    if (layout.AircraftModelId) {
        return;
    }
    
    this._lchanged |= !(layout.getDO().AircraftModelId === this.aircraftModel.id);
    if (this._lchanged) {
        this.aircraftLayouts.store();
    }
}

var aircraftModels = new Utils.MultiIndexedSet(['code']);

exports.AircraftModel = function(args) {
    var model = aircraftModels.get(args);
    
    if (model) {
        model.checkDO(args);
        return model;
    }
    
    return new AircraftModelCreator(args);
}

exports.AircraftModel.get = function(args) {
    var model = aircraftModels.get(args);
    
    if (model) {
        model.checkDO(args);
    }
    
    return model;
}