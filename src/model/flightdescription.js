var db              = require('../db')
  , Utils           = require('../utils')
  , Airport         = require('./country').findAirport
  , Airline         = require('./airline').Airline.get;

var FlightDescription = function(args) {
    if (!args.distance) throw "distance not set";
    if (!args.arrivalTime) throw "arrival time not set";
    if (!args.departureTime) throw "departure time not set";
    if (!args.flightNumber) throw "flight number not set";
    
    if (args.id) {
        this.description = args;
        this._changed = false;
        print("description for flight " + args.flightNumber + " loaded from database");
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
    }
    
    flightDescriptions.push(this);
    
    this.periods = new Utils.DBCollection(
        this.description,
        'setPeriods',
        db.applyLater,
        []
    );
}