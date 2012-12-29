var SeatCreator = function(seat, aircrafttype) {
	if(!seat.row) throw "row attribute of seat missing";
	if(!seat.letter) throw "letter attribute of seat missing";
    this.aircrafttype = aircrafttype;
    print("Seat with row: " + seat.row + " and letter: " + seat.letter + " created");
}

SeatCreator.prototype.Seat = function(args) {
    return this.aircrafttype.Seat(args);
}

var AircraftTypeCreator = function(aircrafttype) {
	if(!aircrafttype.model) throw "model attribute of aircrafttype missing";
	if(!aircrafttype.manufacturer) throw "manufacturer attribute of aircrafttype missing";
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
