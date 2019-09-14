class Utils {
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
        if (target && typeof target.then === 'function') {
            return 'promise'
        }
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(target)) {
            return 'buffer'
        }
        if (target instanceof Error) {
            return 'error'
        }
        return type
    }

    static verify(data = {}, validates) {
        let newData = {}
        for (let key in validates) {
            let target = data[key]
            let type = Utils.getType(target)
            let [required, types, defaultValue] = validates[key]
            if (Utils.getType(required) !== 'boolean') {
                throw new Error('Required must be a boolean')
            }
            if (Utils.getType(types) !== 'array') {
                throw new Error('Types must be a array')
            }
            if (required && target == null) {
                throw new Error(`Key(${key}) is required`)
            }
            if (types && target != null && !types.includes(type)) {
                throw new Error(`Type(${key}::${type}) error, need ${types.join(' or ')}`)
            }
            newData[key] = target === undefined ? defaultValue : target
        }
        return newData
    }

    static generateId() {
        var now = Date.now()
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            now += performance.now()
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (now + Math.random() * 16) % 16 | 0
            now = Math.floor(now / 16)
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })
    }

    static arrayCopy(target) {
        var i = target.length
        var output = []
        while (i--) {
            output[i] = target[i]
        }
        return output
    }

    static order(options) {
        return new Order(options)
    }

    static peel(target, path, def) {
        let output = path.split(/[.[\]'"]/g).filter(s => s !== '').reduce((obj, key) => {
            return obj && obj[key] !== 'undefined' ? obj[key] : undefined
        }, target)
        if (def) {
            return output == null ? def : output
        }
        return output
    }
}

module.exports = Utils

const Order = require('./Order')
