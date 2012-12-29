var SeatClassCreator = function(seatClass) {
	if(!seatClass.name) throw "name attribute of seatClass is missing";
	if(!seatClass.code) throw "name attribute of seatClass is missing";
    this.seatClass = seatClass;
    print("SeatClass " + seatClass.name + " with code " + seatClass.code + " created.");
};

exports.SeatClass = function(args) {
	return new SeatClassCreator(args);
};