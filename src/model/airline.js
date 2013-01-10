var db            = require('../db')
  , Utils         = require('../utils')
  , AircraftModel = require('./aircraftmodel').AircraftModel.get
  , Errors        = require('../error');
  
var SeatCreator = function(seat, seatClass) {
    if (!seat.row) throw new Errors.MissingAttribute("row not set for seat");
    if (!seat.letter) throw new Errors.MissingAttribute("letter not set for seat");
    
    if (seat.id) {
        this.seat = seat;
        print("Seat " + seat.row + "" + seat.letter + " loaded from database");
    } else {
        this.seat = db.Seat.build(seat, ['row', 'letter']);
        db.applyLater(this.seat, 'save', []);
        print("Seat " + seat.row + "" + seat.letter + " created");
    }
    
    this.seatClass = seatClass;
}

SeatCreator.prototype.finishLine = function() {
    return this.seatClass.finishLine();
}

SeatCreator.prototype.getDO = function() {
    return this.seat;
}

SeatCreator.prototype.checkDO = function(args) {
    if (args.row !== this.seat.row) {
        throw new Errors.NoMatch("rows don't match for seat");
    }
    if (args.letter !== this.seat.letter) {
        throw new Errors.NoMatch("letters don't match for seat");
    }
}

SeatCreator.prototype.Seat = function(args) {
    return this.seatClass.Seat(args);
}

SeatCreator.prototype.SeatClass = function(args) {
    return this.seatClass.SeatClass(args);
}

SeatCreator.prototype.Layout = function(args) {
    return this.seatClass.Layout(args);
}

SeatCreator.prototype.AircraftLayout = function(args) {
    return this.seatClass.AircraftLayout(args);
}

var SeatClassCreator = function(seatClass, aircraftLayout) {
    if (!seatClass.name) throw new Errors.MissingAttribute("name not set for seat class");
    if (!seatClass.code) throw new Errors.MissingAttribute("code not set for seat class");
    
    if (seatClass.id) {
        this.seatClass = seatClass;
        this._changed = false;
        print("Seat class " + seatClass.name + " loaded from database");
    } else {
        this.seatClass = db.SeatClass.build(seatClass, ['name', 'code']);
        db.applyLater(this.seatClass, 'save', []);
        this._changed = true;
        print("Seat class " + seatClass.name + " created");
    }
    
    this.aircraftLayout = aircraftLayout;
    
    this.seats = new Utils.DBCollection(
        this.seatClass,
        'setSeats',
        db.applyLater,
        [ function (seat) { return seat.letter + seat.row; } ]
    );
    
    this.prices = new Utils.DBCollection(
        this.seatClass,
        'setPrices',
        db.applyLater,
        []
    );
}

SeatClassCreator.prototype.finishLine = function() {
    return this.aircraftLayout.finishLine();
}

SeatClassCreator.prototype.store = function() {
    if (this._changed) {
        this.seats.store();
    }
}

SeatClassCreator.prototype.getDO = function() {
    return this.seatClass;
}

SeatClassCreator.prototype.checkDO = function(args) {
    if (args.code && args.code !== this.seatClass.code) {
        throw new Errors.NoMatch("code doesn't match for seat class");
    }
    if (args.name && args.name !== this.seatClass.name) {
        throw new Errors.NoMatch("name doesn't match for seat class");
    }
}

SeatClassCreator.prototype.SeatClass = function(args) {
    return this.aircraftLayout.SeatClass(args);
}

SeatClassCreator.prototype.Layout = function(args) {
    return this.aircraftLayout.Layout(args);
}

SeatClassCreator.prototype.AircraftLayout = function(args) {
    return this.aircraftLayout.AircraftLayout(args);
}

SeatClassCreator.prototype.Seat = function(args) {
    var seat = this.seats.get(args);
    
    if (seat) {
        seat.checkDO(args);
        return seat;
    }
    
    seat = new SeatCreator(args, this);
    this.seats.push(seat);
    this.aircraftLayout.seats.push(seat);
    
    this._changed |= !(args.SeatClassId && args.SeatClassId === this.seatClass.id);
    
    return seat;
}

SeatClassCreator.prototype._Price = function (args) {
    this.prices.push(args);
    
    if (args.SeatClassId) {
        return;
    }
    
    this._changed |= !(args.getDO().SeatClassId === this.seatClass.id);
    if (this._changed) {
        this.prices.store();
    }
}

var AircraftLayoutCreator = function(layout, airline, pModel) {
    if (!layout.name) throw new Errors.MissingAttribute("name not set for AircraftLayout");
    if (!layout.modelCode && !layout.AircraftModelId) throw new Errors.MissingAttribute("modelcode not set for AircraftLayout");
    
    if (layout.id) {
        this.layout = layout;
        this._changed = false;
        this._model = pModel;
        print("Aircraft layout " + layout.name + " loaded from database");
    } else {
        this.layout = db.AircraftLayout.build(layout, ['name']);
        db.applyLater(this.layout, 'save', []);
        print("Aircraft model " + layout.name + " created for airline " + airline.airline.name);

        var model = AircraftModel({ code: layout.modelCode });
        
        if (!model) {
            throw new Errors.InvalidArgument("aircraft model with code  " + layout.modelCode + " doesn't exist");
        }
        
        this._model = model;
    }
    
    this._model._Layout(this);
    
    this.airline = airline;
    this.seatClasses = new Utils.DBCollection(
        this.layout,
        'setSeatClasses',
        db.applyLater,
        ['code']
    );
    
    this.seats = new Utils.MultiIndexedSet([function(seat) { return seat.letter + seat.row; }]);
}

AircraftLayoutCreator.prototype.finishLine = function() {
    return this.airline.finishLine();
}

AircraftLayoutCreator.prototype.store = function () {
    if (this._changed) {
        this.seatClasses.store();
    }
    
    this.seatClasses.forEach(
        function(seatClass) {
            seatClass.store();
        }
    );
}

AircraftLayoutCreator.prototype.getDO = function() {
    return this.layout;
}

AircraftLayoutCreator.prototype.checkDO = function(args) {
    if (args.name !== this.layout.name) {
        throw new Errors.NoMatch("Aircraft layout names don't match");
    }
    if (args.modelCode && args.modelCode !== this._model.getDO().code) {
        throw new Errors.NoMatch("Aircraft models don't match");
    }
}

AircraftLayoutCreator.prototype.Layout = function(args) {
    return this.airline.Layout(args);
}

AircraftLayoutCreator.prototype.AircraftLayout = function(args) {
    return this.airline.AircraftLayout(args);
}

AircraftLayoutCreator.prototype.SeatClass = function(args) {
    var seatClass = this.seatClasses.get(args);
    
    if (seatClass) {
        seatClass.checkDO(args);
        return seatClass;
    }
    
    seatClass = new SeatClassCreator(args, this);
    this.seatClasses.push(seatClass);
    
    this._changed |= !(args.AircraftLayoutId && args.AircraftLayoutId === this.layout.id);
    
    return seatClass;
}

var AirlineCreator = function(airline) {
	if(!airline.name) throw new Errors.MissingAttribute("name attribute of airline missing");
	if(!airline.code) throw new Errors.MissingAttribute("code attribute of airline missing");

    if (airline.id) {
        this.airline = airline;
        print("Airline with code " + airline.code + " loaded from database");
        this._changed = false;
    } else {
        this.airline = db.Airline.build(airline, ['name', 'code']);
        db.applyLater(this.airline, 'save', []);
        print("Airline with name: " + airline.name + " and code: " + airline.code + " created");
        this._changed = true;
    }
    airlines.push(this);
    
    this.layouts = new Utils.DBCollection(
        this.airline,
        'setAircraftLayouts',
        db.applyLater,
        ['name']
    );
    
    var self = this
    this.AircraftLayout =
    this.Layout.get = function(args) {
        var layout = self.layouts.get(args);
        if (layout) {
            layout.checkDO(args);
        }
        return layout;
    }
}

AirlineCreator.prototype.getDO = function () {
    return this.airline;
}

AirlineCreator.prototype.checkDO = function(args) {
    if (args.code !== this.airline.code) {
        throw new Errors.NoMatch("Airline codes don't match");
    }
    if (args.name && args.name !== this.airline.name) {
        throw new Errors.NoMatch("Airline names don't match for code " + args.code);
    }
}

AirlineCreator.prototype.finishLine = function() {
    if (this._changed) {
        this.layouts.store();
    }
    
    this.layouts.forEach(
        function (layout) {
            layout.store();
        }
    )
}

AirlineCreator.prototype.AircraftLayout =
AirlineCreator.prototype.Layout = function(args, model) {
    var layout = this.layouts.get(args);
    
    if (layout) {
        layout.checkDO(args);
        return layout;
    }
    
    layout = new AircraftLayoutCreator(args, this, model);
    this.layouts.push(layout);
    
    this._changed |= !(args.AirlineId && args.AirlineId === this.airline.id);
    
    return layout;
}

var airlines = new Utils.MultiIndexedSet(['code']);

exports.Airline = function(args) {
    var airline = airlines.get(args);
    if (airline) {
        airline.checkDO(args);
        return airline;
    }
	return new AirlineCreator(args);
};

exports.Airline.get = function(args) {
    var airline = airlines.get(args);
    if (airline) airline.checkDO(args);
    return airline;
}
