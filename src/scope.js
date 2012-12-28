exports.Country = function() {
	print("Country!");
    return {
        City: function() {
            print("City!");
            return {
                Airport: function () {
                    print("Airport!");
                }
            }
        }
    };
};

exports.AirlineCompany = function() {
	print("AirlineCompany!");
};
