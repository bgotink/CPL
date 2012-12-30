var db      = require('../db')
  , Utils   = require('../utils');

var SeatCreator = function(seat, aircrafttype) {
	if(!seat.row) throw "row attribute of seat missing";
	if(!seat.letter) throw "letter attribute of seat missing";
    
    this.seat = db.Seat.build(
        seat,
        ['row', 'letter']
    );
    db.applyLater(this.seat, 'save');
    
    this.aircrafttype = aircrafttype;
    
    print("Seat with row: " + seat.row + " and letter: " + seat.letter + " created");
}

SeatCreator.prototype.Seat = function(args) {
    return this.aircrafttype.Seat(args);
}

SeatCreator.prototype.finishLine = function() {
    this.aircrafttype.finishLine();
}

var AircraftTypeCreator = function(aircrafttype) {
	if(!aircrafttype.model) throw "model attribute of aircrafttype missing";
	if(!aircrafttype.manufacturer) throw "manufacturer attribute of aircrafttype missing";
    
    this.aircrafttype = db.AircraftType.build(
        aircrafttype,
        ['model', 'manufacturer']
    );
    db.applyLater(this.aircrafttype, 'save');
    
    this.seats = [];
    print("AircraftType with model: " + aircrafttype.model + " and manufacturer: " + aircrafttype.manufacturer + " created");
}

AircraftTypeCreator.prototype.Seat = function(args) {
    var seat = new SeatCreator(args, this);
    this.seats.push(seat);
    return seat;
}

AircraftTypeCreator.prototype.finishLine = function() {
    var seatDOs = this.seats.map(
        function(e) { return e.seat; }
    );
    
    db.applyLater(this.aircrafttype, 'setSeats', [seatDOs]);
}

exports.AircraftType = function(args) {
	return new AircraftTypeCreator(args);
};
