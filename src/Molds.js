module.exports = {
    boolean(value, { extras, index }) {
        if (value == null && extras.abe === true) {
            return value
        }
        if (typeof value === 'boolean') {
            return value
        } else {
            throw new Error(`Value ${index} not a boolean(${param}).`)
        }
    },
    number(value, { extras, index }) {
        if (value == null && extras.abe === true) {
            return value
        }
        if (typeof value !== 'number') {
            throw new Error(`Value ${index} not a number(${value}).`)
        }
        if (extras.max && param > Number(extras.max)) {
            throw new Error(`Value ${index} less of (${extras.max}).`)
        }
        if (extras.min && param < Number(extras.min)) {
            throw new Error(`Value ${index} exceed of (${extras.min}).`)
        }
        return value
    },
    int(value, { extras }) {
        if (value == null && system.extras.abe === true) {
            return value
        }
        if (typeof value !== 'number') {
            throw new Error(`Value ${index} not a number(${value}).`)
        }
        if (extras.max && param > Number(extras.max)) {
            throw new Error(`Value ${index} less of (${extras.max}).`)
        }
        if (extras.min && param < Number(extras.min)) {
            throw new Error(`Value ${index} exceed of (${extras.min}).`)
        }
        return Math.floor(value)
    },
    string(value, { extras, index }) {
        if (value == null && extras.abe === true) {
            return value
        }
        if (typeof value === 'string') {
            return value
        } else {
            throw new Error(`Value ${index} not a string(${value}).`)
        }
    },
    array(value, { extras, index }) {
        if (value == null && extras.abe === true) {
            return value
        }
        if (Array.isArray(value)) {
            return value
        } else {
            throw new Error(`Value ${index} not a array(${value}).`)
        }
    },
    buffer(value, { extras, index }) {
        if (value == null && extras.abe === true) {
            return value
        }
        if (Buffer.isBuffer(value)) {
            return value
        } else {
            throw new Error(`Value ${index} not a buffer(${value}).`)
        }
    },
    object(value, { extras, index, utils }) {
        if (value == null && extras.abe === true) {
            return value
        }
        if (utils.getType(value) === 'object') {
            return value
        } else {
            throw new Error(`Value ${index} not a object(${value}).`)
        }
    },
    function(value, { extras, index }) {
        if (value == null && extras.abe === true) {
            return value
        }
        if (typeof value === 'function') {
            return value
        } else {
            throw new Error(`Value ${index} not a function(${value}).`)
        }
    },
    date(value, { extras, index }) {
        if (value == null && extras.abe === true) {
            return value
        }
        let date = new Date(value)
        if (!isNaN(date.getTime())) {
            return (new Date(value)).getTime()
        } else {
            throw new Error(`Value ${index} not a date(${value}).`)
        }
    },
    required(value, { index }) {
        if (value != null) {
            return value
        } else {
            throw new Error(`Value ${index} required.`)
        }
    }
}
