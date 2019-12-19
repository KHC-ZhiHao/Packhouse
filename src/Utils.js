class Utils {
    static getType(target) {
        let type = typeof target
        if (target == null) {
            return 'empty'
        }
        if (Array.isArray(target)) {
            return 'array'
        }
        if (type === 'number' && isNaN(target)) {
            return 'NaN'
        }
        if (target instanceof RegExp) {
            return 'regexp'
        }
        if (target instanceof Promise) {
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

    static verify(data = {}, validate) {
        let newData = {}
        if (Utils.getType(data) !== 'object') {
            throw new Error('Param not a object.')
        }
        for (let key in validate) {
            let target = data[key]
            let type = Utils.getType(target)
            let [required, types, defaultValue] = validate[key]
            if (Utils.getType(required) !== 'boolean') {
                throw new Error('Required must be a boolean.')
            }
            if (Utils.getType(types) !== 'array') {
                throw new Error('Types must be a array.')
            }
            if (required && target == null) {
                throw new Error(`Key(${key}) is required.`)
            }
            if (types && target != null && !types.includes(type)) {
                throw new Error(`Type(${key}:${type}) error, need ${types.join(' or ')}.`)
            }
            if (target === undefined) {
                if (defaultValue != null && typeof defaultValue === 'object') {
                    throw new Error(`Default value can't be a object, try use function return value.`)
                }
                newData[key] = typeof defaultValue === 'function' ? defaultValue() : defaultValue
            } else {
                newData[key] = target
            }
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

    static arrayCopy(array) {
        var i = array.length
        var output = []
        while (i--) {
            output[i] = array[i]
        }
        return output
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

    static loader(handler) {
        let response = null
        return (...args) => {
            if (response == null) {
                response = new Promise(handler)
            }
            return new Promise((resolve, reject) => {
                response.then(result => resolve(result(...args)), reject)
            })
        }
    }
}

module.exports = Utils
