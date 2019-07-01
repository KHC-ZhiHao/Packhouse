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

    static createArgs(target, supports) {
        let args = new Array(target.length)
        let packages = supports.package
        let length = packages.length + target.length
        let packageLength = supports.package.length
        for (let i = 0; i < length; i++) {
            args[i] = i >= packageLength ? target[i - packageLength] : packages[i]
        }
        return args
    }

    static createId() {
        return Date.now() + Math.floor(Math.random() * 1000000)
    }
}

module.exports = Helper
