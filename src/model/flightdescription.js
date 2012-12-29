////// FlightDescription
var FlightDescriptionCreator = function(flightDescription) {
    if(!flightDescription.flight_number)
    	throw "flight_number attribute of flightDescription is missing";
    if(!flightDescription.distance)
    	throw "distance attribute of flightDescription is missing";
    if(!flightDescription.departure_time)
    	throw "departure_time attribute of flightDescription is missing";
    if(!flightDescription.arrival_time)
    	throw "arrival_time attribute of flightDescription is missing";
    this.flightDescription = flightDescription;
    this.flightDescriptionPeriods = [];
    print("FlightDescription with number " + flightDescription.flight_number + " created");
}

FlightDescriptionCreator.prototype.FlightDescriptionPeriod = function(args) {
    var flightDescriptionPeriod = new FlightDescriptionPeriodCreator(args, this)
    this.flightDescriptionPeriods.push(flightDescriptionPeriod);
    return flightDescriptionPeriod;
}

exports.FlightDescription = function(args) {
	return new FlightDescriptionCreator(args);
};


////// FlightDescriptionPeriod
var FlightDescriptionPeriodCreator = function(flightDescriptionPeriod, flightDescription) {
    if(!flightDescriptionPeriod.validFrom)
    	throw "validFrom attribute of flightDescriptionPeriod is missing";
    if(!flightDescriptionPeriod.validTo)
    	throw "validTo attribute of flightDescriptionPeriod is missing";
    if(!flightDescriptionPeriod.dayOfMonth)
    	throw "dayOfMonth attribute of flightDescriptionPeriod is missing";
    if(!flightDescriptionPeriod.dayOfWeek)
    	throw "dayOfWeek attribute of flightDescriptionPeriod is missing";
	this.flightDescription = flightDescription;
    this.flightDescriptionPeriod = flightDescriptionPeriod;
    this.prices = [];
    this.dateExceptions = [];
    print("FlightDescriptionPeriod from " + flightDescriptionPeriod.validFrom + 
    		" until " + flightDescriptionPeriod.validTo + " created");
}

FlightDescriptionPeriodCreator.prototype.Price = function(args) {
    var price = new PriceCreator(args, this)
    this.prices.push(price);
    return price;
}

FlightDescriptionPeriodCreator.prototype.DateException = function(args) {
    var dateException = new DateExceptionCreator(args, this)
    this.dateExceptions.push(dateException);
    return dateException;
}

FlightDescriptionPeriodCreator.prototype.FlightDescriptionPeriod = function(args) {
    return this.flightDescription.FlightDescriptionPeriod(args);
}


////// Price
var PriceCreator = function(price, flightDescriptionPeriod) {
	if(!price.price) throw "price attribute of price is missing";
	if(!price.seatClass) throw "seatClass attribute of price is missing";
	//TODO checken of de meegegeven seatClass al bestaat in de database
	this.flightDescriptionPeriod = flightDescriptionPeriod;
    this.price = price;
    print("Price " + price.price + " for seatClass " + price.seatClass + " created");
}

PriceCreator.prototype.FlightDescriptionPeriod = function(args) {
	return this.flightDescriptionPeriod.FlightDescriptionPeriod(args);
}

PriceCreator.prototype.Price = function(args) {
    return this.flightDescriptionPeriod.Price(args);
}

PriceCreator.prototype.DateException = function(args) {
    return this.flightDescriptionPeriod.DateException(args);
}

////// DateException
var DateExceptionCreator = function(dateException, flightDescriptionPeriod) {
	if(!dateException.day) throw "day attribute of dateException is missing";
	if(!dateException.month) throw "month attribute of dateException is missing";
	//TODO nakijken of de meegegeven dag in een bestaande periode valt
	this.flightDescriptionPeriod = flightDescriptionPeriod;
    this.dateException = dateException;
    print("DateException for " + dateException.day + " " + dateException.month + " created");
}

DateExceptionCreator.prototype.FlightDescriptionPeriod = function(args) {
	return this.flightDescriptionPeriod.FlightDescriptionPeriod(args);
}

DateExceptionCreator.prototype.Price = function(args) {
    return this.flightDescriptionPeriod.Price(args);
}

DateExceptionCreator.prototype.DateException = function(args) {
    return this.flightDescriptionPeriod.DateException(args);
}
