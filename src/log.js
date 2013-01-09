var NodeUtil = require('util');

var settings = 
module.exports.LogSettings = {
    DEBUG: (process.env.ENVIRONMENT == 'debug'),
    INFO: true,
    ERROR: true
}

module.exports.debug = function () {
    if (!settings.DEBUG && (process.env.ENVIRONMENT != 'debug')) return;
    
    NodeUtil.log(
        "[DEBUG] - " +
        NodeUtil.format.apply(null, arguments)
    );
}

module.exports.info = function () {
    if (!settings.INFO) return;
    
    NodeUtil.log(
        "[INFO ] - " +
        NodeUtil.format.apply(null, arguments)
    );
}

module.exports.error = function () {
    if (!settings.ERROR) return;
    
    NodeUtil.log(
        "[ERROR] - " +
        NodeUtil.format.apply(null, arguments)
    );
}

module.exports.sql = function () {
    NodeUtil.log(
        "[SQL  ] - " +
        NodeUtil.format.apply(null, arguments)
    );
}