/*
 * Usage:
 * node parser.js airports.csv > airports.dsl
 *
 * airports.csv is obtained from http://www.ourairports.com/data/
 */

var CSV         = require('csv')()
  , FileSystem  = require('fs')
  , Util        = require('util')
  , ISO = require('./iso');

var countries = {};

CSV
    .from.path(process.argv[2], { columns: true })
    .on('record', function(data, index){
        switch (data["type"]) {
            case "small_airport":
            case "medium_airport":
            case "large_airport":
                if (!data["iata_code"] || !data["municipality"] || !data["iso_country"] || !data["name"]) return;

                // Get country and create if necessary
                var countryCode = data["iso_country"];
                if (!countries[countryCode]) {
                    countries[countryCode] = {
                        name: ISO[countryCode],
                        code: countryCode,
                        cities: {}
                    };
                }

                var cityName = data["municipality"];
                if (!countries[countryCode].cities[cityName]) {
                    countries[countryCode].cities[cityName] = [];
                }
                countries[countryCode].cities[cityName].push({
                    code:       data["iata_code"],
                    name:       data["name"],
                    latitude:   data["latitude_deg"],
                    longitude:  data["longitude_deg"]
                });

                break;
        }
    })
    .on('end', function(count){
        for(var countryCode in countries) {
            var country = countries[countryCode];
            var cities = country.cities;
            delete country.cities;
            console.log('Country' + Util.inspect(country));
            for(var city in cities)
            {
                console.log('    .City{ name: "' + city + '" }');
                for(var i = 0; i < cities[city].length; i++) {
                    console.log('        .Airport' + Util.inspect(cities[city][i]).replace(/\n/g, ''));
                }
            }
        }
    })
    .on('error', function(error){
        //console.log(error.message);
    });