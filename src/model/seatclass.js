var db      = require('../db')
  , Utils   = require('../utils');

var SeatClassCreator = function(seatClass) {
	if(!seatClass.name) throw "name attribute of seatClass is missing";
	if(!seatClass.code) throw "code attribute of seatClass is missing";
    
    this.seatClass = db.SeatClass.build(
        seatClass,
        ['name', 'code']
    );
    db.applyLater(this.seatClass, 'save');
    
    print("SeatClass " + seatClass.name + " with code " + seatClass.code + " created.");
};

exports.SeatClass = function(args) {
	return new SeatClassCreator(args);
};
