var db            = require('../db')
  , Utils         = require('../utils')
  , AircraftModel = require('./aircraftmodel').AircraftModel.get;
  
var SeatCreator = function(seat, seatClass) {
    if (!seat.row) throw "row not set for seat";
    if (!seat.letter) throw "letter not set for seat";
    
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
        throw "rows don't match for seat";
    }
    if (args.letter !== this.seat.letter) {
        throw "letters don't match for seat";
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
    if (!seatClass.name) throw "name not set for seat class";
    if (!seatClass.code) throw "code not set for seat class";
    
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
        throw "code doesn't match for seat class";
    }
    if (args.name && args.name !== this.seatClass.name) {
        throw "name doesn't match for seat class";
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
    
    this._changed |= !(args.SeatClassId && args.SeatClassId === this.seatClass.id);
    
    return seat;
}

var AircraftLayoutCreator = function(layout, airline) {
    if (!layout.name) throw "name not set for AircraftLayout";
    if (!layout.modelCode && !layout.AircraftModelId) throw "modelcode not set for AircraftLayout";
    
    if (layout.id) {
        this.layout = layout;
        this._changed = false;
        print("Aircraft layout " + layout.name + " loaded from database");
    } else {
        this.layout = db.AircraftLayout.build(layout, ['name']);
        db.applyLater(this.layout, 'save', []);
        print("Aircraft model " + layout.name + " created for airline " + airline.airline.name);
    }
    
    if (!this.layout.AircraftModelId) {
        var model = AircraftModel({ code: layout.modelCode });
        
        if (!model) {
            throw "aircraft model with code  " + layout.modelCode + " doesn't exist";
        }
        
        model._Layout(this);
    }
    
    this.airline = airline;
    this.seatClasses = new Utils.DBCollection(
        this.layout,
        'setSeatClasses',
        db.applyLater,
        ['code', 'name']
    );
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
        throw "Aircraft layout names don't match";
    }
}

AircraftLayoutCreator.prototype.Layout = function(args) {
    this.airline.Layout(args);
}

AircraftLayoutCreator.prototype.AircraftLayout = function(args) {
    this.airline.AircraftLayout(args);
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
	if(!airline.name) throw "name attribute of airline missing";
	if(!airline.code) throw "code attribute of airline missing";

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
}

AirlineCreator.prototype.getDO = function () {
    return this.airline;
}

AirlineCreator.prototype.checkDO = function(args) {
    if (args.code !== this.airline.code) {
        throw "Airline codes don't match";
    }
    if (args.name && args.name !== this.airline.name) {
        throw "Airline names don't match for code " + args.code;
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

AirlineCreator.prototype.Layout = function(args) {
    var layout = this.layouts.get(args);
    
    if (layout) {
        layout.checkDO(args);
        return layout;
    }
    
    layout = new AircraftLayoutCreator(args, this);
    this.layouts.push(layout);
    
    this._changed |= !(args.AirlineId && args.AirlineId === this.airline.id);
    
    return layout;
}

AirlineCreator.prototype.AircraftLayout = AirlineCreator.prototype.Layout;

var airlines = new Utils.MultiIndexedSet(['code']);

exports.Airline = function(args) {
    var airline = airlines.get(args);
    if (airline) {
        airline.checkDO(args);
        return airline;
    }
	return new AirlineCreator(args);
};