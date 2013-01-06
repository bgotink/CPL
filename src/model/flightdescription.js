var db              = require('../db')
  , Utils           = require('../utils')
  , Airport         = require('./country').findAirport
  , Airline         = require('./airline').Airline.get;

var FlightDescriptionCreator = function(args) {
    if (!args.distance) throw "distance not set";
    if (!args.arrivalTime) throw "arrival time not set";
    if (!args.departureTime) throw "departure time not set";
    if (!args.flightNumber) throw "flight number not set";
    
    if (args.id) {
        this.description = args;
        this._changed = false;
        print("description for flight " + args.flightNumber + " loaded from database");
        
        this._from = args.FromId; this._to = args.ToId;
        this._airline = args.AirlineId; this._layout = args.AircraftLayoutId;
    } else {
        if (!args.from) throw "from not set";
        if (!args.to) throw "to not set";
        if (!args.airline) throw "airline not set";
        if (!args.aircraftLayout) throw "aircraft model not set";
        
        this.description = db.FlightDescription.build(args, ['distance', 'arrivalTime', 'departureTime', 'flightNumber']);
        db.applyLater(this.description, 'save', []);
        this._changed = true;
        
        var from, to, airline, layout;
        from = Airport({ code: args.from });
        if (!from) throw "unexistent airport code: " + args.from;
        to = Airport({ code: args.to });
        if (!to) throw "unexistent airport code: " + args.to;
        
        db.applyLater(this.description, 'setFrom', from.airport);
        db.applyLater(this.description, 'setTo', to.airport);
        
        airline = Airline({ code: args.airline });
        if (!airline) throw "unexistent airline code: " + args.airline;
        model = airline.AircraftLayout({name: args.aircraftLayout});
        if (!model) throw "unexistent aircraft model " + args.aircraftLayout + " for airline " + args.airline;
        
        db.applyLater(this.description, 'setLayout', model.model);
        
        print("description for flight " + args.flightNumber + " loaded from database");
        
        this._from = from.id; this._to = to.id;
        this._airline = airline.id; this._layout = model.id;
    }
    
    flightDescriptions.push(this);
    
    this.periods = new Utils.DBCollection(
        this.description,
        'setPeriods',
        db.applyLater,
        []
    );
}

FlightDescriptionCreator.prototype.getDO = function () {
    return this.description;
}

FlightDescriptionCreator.prototype.checkDO = function (args) {
    if (args.flightNumber !== this.description.flightNumber) {
        throw "flight numbers don't match";
    }
    if (args.distance && args.distance !== this.description.distance) {
        throw "distances don't match";
    }
    if (args.arrivalTime && args.arrivalTime !== this.description.arrivalTime) {
        throw "arrival times don't match";
    }
    if (args.departureTime && args.departureTime !== this.description.departureTime) {
        throw "departure times don't match";
    }
    // FIXME check airline, aicraft layout, from and to somehow...
    /*
    solution: overload constructor: allow usage of constructor with more arguments,
    being the from, to, airline, layout etc
    TODO also fix this problem for the layout, where the aircraft model is simply
    assumed to be correct
    TODO rewrite the index function below: when used for set, this is a fully
    functional DO, when used for get, this hasn't passed through the constructor
    (yet), so desc._airline doesn't work, desc.description is wrong etc, etc
    */
}

var flightDescriptions = new Utils.MultiIndexedSet(
    [
    function (desc) {
        return desc._airline + "-__-" + desc.description.flightNumber;
    }
    ]
);

module.exports.FlightDescription = function (args) {
    var desc = flightDescriptions.get(args);
    
    if (desc) {
        desc.checkDO(args);
        return desc;
    }
    
    return new FlightDescriptionCreator(args);
}