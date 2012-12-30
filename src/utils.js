Object.defineProperty(
    Array.prototype,
    'map',
    {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (func) {
            var dest = [];
            this.forEach(
                function(e) {
                    dest.push(func(e));
                }
            );
            return dest;
        }
    }
)

module.exports.map = function(src, func) {
    return src.map(func);
}