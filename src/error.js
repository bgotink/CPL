(function () {
    
    var NodeUtil = require('util');
    
    var createError = function (name, _super) {
        var errFunc = function (message) {
            Error.call(this);
            Error.captureStackTrace(this, this.constructor);
            
            this.name = name;
            this.message = message;
        }
        NodeUtil.inherits(errFunc, _super ? _super : Error);
        errFunc.prototype.name =
        errFunc.name =
        errFunc.prototype.constructor.name = name;
        
        return errFunc;
    };
    
    var InvalidArgument = createError('InvalidArgumentError');
    
    module.exports = {
        InvalidArgument: InvalidArgument,
        NotFound: createError('NotFoundError', InvalidArgument),
        Duplicate: createError('DuplicateError', InvalidArgument),
        NoMatch: createError('DataMismatchError', InvalidArgument),
        MissingAttribute: createError('MissingAttributeError', InvalidArgument)
    }
    
})();