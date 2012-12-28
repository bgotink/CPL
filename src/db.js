var Sequelize = require('sequelize');

var sequelize = new Sequelize('cpl', 'cpl', 'cpl', {
    dialect: 'sqlite',
    storage: '../data/dsl.db'
});