class Helper {
    static isAsyncFunction(target) {
        return Object.prototype.toString.call(target) === '[object AsyncFunction]'
    }

    static getType(target) {
        let type = typeof target
        if (Array.isArray(target)) {
            return 'array'
        }
        if (target == null) {
            return 'empty'
        }
        if (type === 'number' && isNaN(target)) {
            return 'NaN'
        }
        if (target instanceof RegExp) {
            return 'regexp'
        }
        return type
    }

    static arrayCopy(target) {
        var i = target.length
        var output = []
        while (i--) {
            output[i] = target[i]
        }
        return output
    }
}

module.exports = Helper
