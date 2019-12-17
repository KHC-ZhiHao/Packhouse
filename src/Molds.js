module.exports = {
    type(value, { extras, index, utils, message = '' }) {
        if (extras.is == null) {
            throw new Error(`Type mold must have 'is' params.`)
        }
        let type = extras.is
        if (utils.getType(value) === type) {
            return value
        } else {
            throw new Error(`${message}Parameter ${index} not a ${type}.`)
        }
    },
    boolean(value, { index, message = '' }) {
        if (typeof value === 'boolean') {
            return value
        } else {
            throw new Error(`${message}Parameter ${index} not a boolean(${value}).`)
        }
    },
    number(value, { extras, index, message = '' }) {
        if (typeof value !== 'number') {
            throw new Error(`${message}Parameter ${index} not a number(${value}).`)
        }
        if (extras.max && value > Number(extras.max)) {
            throw new Error(`${message}Parameter ${index} less of (${extras.max}).`)
        }
        if (extras.min && value < Number(extras.min)) {
            throw new Error(`${message}Parameter ${index} exceed of (${extras.min}).`)
        }
        return value
    },
    int(value, { extras, message = '' }) {
        if (typeof value !== 'number') {
            throw new Error(`${message}Parameter ${index} not a number(${value}).`)
        }
        if (extras.max && value > Number(extras.max)) {
            throw new Error(`${message}Parameter ${index} less of (${extras.max}).`)
        }
        if (extras.min && value < Number(extras.min)) {
            throw new Error(`${message}Parameter ${index} exceed of (${extras.min}).`)
        }
        return Math.floor(value)
    },
    string(value, { extras, index, message = '' }) {
        if (typeof value === 'string') {
            if (extras.is) {
                let success = false
                let split = extras.is.split(',')
                for (let target of split) {
                    if (value === target.trim()) {
                        success = true
                        break
                    }
                }
                if (success === false) {
                    throw new Error(`${message}Parameter ${index} must be ${extras.is.trim()}(${value}).`)
                }
            }
            return value
        } else {
            throw new Error(`${message}Parameter ${index} not a string(${value}).`)
        }
    },
    array(value, { index, message = '' }) {
        if (Array.isArray(value)) {
            return value
        } else {
            throw new Error(`${message}Parameter ${index} not a array(${value}).`)
        }
    },
    buffer(value, { index, message = '' }) {
        if (Buffer.isBuffer(value)) {
            return value
        } else {
            throw new Error(`${message}Parameter ${index} not a buffer(${value}).`)
        }
    },
    object(value, { index, message = '', utils }) {
        if (utils.getType(value) === 'object') {
            return value
        } else {
            throw new Error(`${message}Parameter ${index} not a object(${value}).`)
        }
    },
    function(value, { index, message = '' }) {
        if (typeof value === 'function') {
            return value
        } else {
            throw new Error(`${message}Parameter ${index} not a function(${value}).`)
        }
    },
    date(value, { index, message = '' }) {
        if (!(typeof value).match(/string|number/)) {
            throw new Error(`${message}Parameter ${index} not a string or number(${value}).`)
        }
        let date = new Date(value)
        let time = date.getTime()
        if (!isNaN(time)) {
            return time
        } else {
            throw new Error(`${message}Parameter ${index} not a date(${value}).`)
        }
    },
    required(value, { index, message = '' }) {
        if (value != null) {
            return value
        } else {
            throw new Error(`${message}Parameter ${index} required.`)
        }
    }
}
