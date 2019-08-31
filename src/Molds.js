module.exports = {
    boolean: {
        check(value, { extras, index }) {
            if (value == null && extras.abe === true) {
                return true
            }
            return typeof value === 'boolean' ? true : `Value ${index} not a boolean(${param}).`
        }
    },
    number: {
        check(value, { extras, index }) {
            if (value == null && extras.abe === true) {
                return true
            }
            if (typeof value !== 'number') {
                return `Value ${index} not a number(${value}).`
            }
            if (extras.max && param > Number(extras.max)) {
                return 'max:' + extras.max
            }
            if (extras.min && param < Number(extras.min)) {
                return 'min:' + extras.min
            }
            return true
        }
    },
    int: {
        check(value, { extras }) {
            if (value == null && system.extras.abe === true) {
                return true
            }
            return system.check(`number|min:${extras.min}|max:${extras.max}`, value)
        },
        casting(value) {
            return Math.floor(value)
        }
    },
    string: {
        check(value, { extras, index }) {
            if (value == null && extras.abe === true) {
                return true
            }
            return typeof value === 'string' ? true : `Value ${index} not a string(${value}).`
        }
    },
    array: {
        check(value, { extras, index }) {
            if (value == null && extras.abe === true) {
                return true
            }
            return Array.isArray(value) ? true : `Value ${index} not a array(${value}).`
        }
    },
    buffer: {
        check(value, { extras, index }) {
            if (value == null && extras.abe === true) {
                return true
            }
            return Buffer.isBuffer(value) ? true : `Value ${index} not a buffer(${value}).`
        }
    },
    object: {
        check(value, { extras, index }, utils) {
            if (value == null && extras.abe === true) {
                return true
            }
            if (utils.getType(value) !== 'object') {
                return `Value ${index} not a object(${value}).`
            }
            return true
        }
    },
    function: {
        check(value, { extras, index }) {
            if (value == null && extras.abe === true) {
                return true
            }
            return typeof value === 'function' ? true : `Value ${index} not a function(${value}).`
        }
    },
    date: {
        check(value, { extras, index }) {
            if (value == null && extras.abe === true) {
                return true
            }
            let date = new Date(value)
            return !isNaN(date.getTime()) ? true : `Value ${index} not a date(${value}).`
        },
        casting(value) {
            return (new Date(value)).getTime()
        }
    },
    required: {
        check(value, system) {
            return value != null ? true : `Value ${system.index} required.`
        }
    }
}
