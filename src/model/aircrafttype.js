var SeatCreator = function(seat, aircrafttype) {
    this.aircrafttype = aircrafttype;
    print("Seat with row: " + seat.row + " and letter: " + seat.letter + " created");
}

SeatCreator.prototype.Seat = function(args) {
    return this.aircrafttype.Seat(args);
}

var AircraftTypeCreator = function(aircrafttype) {
    this.aircrafttype = aircrafttype;
    this.seats = [];
    print("AircraftType with model: " + aircrafttype.model + " and manufacturer: " + aircrafttype.manufacturer + " created");
}

AircraftTypeCreator.prototype.Seat = function(args) {
    var seat = new SeatCreator(args, this)
    this.seats.push(seat);
    return seat;
}

exports.AircraftType = function(args) {
	return new AircraftTypeCreator(args);
};
