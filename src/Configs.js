module.exports = {
    defaultMolds: {
        boolean: {
            check(param, system) {
                if (param == null && system.extras.abe === true) { return true }
                return typeof param === 'boolean' ? true : `Param ${system.index} not a boolean(${param}).`
            }
        },
        number: {
            check(param, system) {
                if (param == null && system.extras.abe === true) { return true }
                if (typeof param !== 'number') {
                    return `Param ${system.index} not a number(${param}).`
                }
                if (system.extras.max && param > Number(system.extras.max)) {
                    return 'max:' + system.extras.max
                }
                if (system.extras.min && param < Number(system.extras.min)) {
                    return 'min:' + system.extras.min
                }
                return true
            }
        },
        int: {
            check(param, system) {
                if (param == null && system.extras.abe === true) { return true }
                return system.check(`number|min:${system.extras.min}|max:${system.extras.max}`, param)
            },
            casting(param) {
                return Math.floor(param)
            }
        },
        string: {
            check(param, system) {
                if (param == null && system.extras.abe === true) { return true }
                return typeof param === 'string' ? true : `Param ${system.index} not a string(${param}).`
            }
        },
        array: {
            check(param, system) {
                if (param == null && system.extras.abe === true) { return true }
                return Array.isArray(param) ? true : `Param ${system.index} not a array(${param}).`
            }
        },
        object: {
            check(param, system) {
                if (param == null && system.extras.abe === true) { return true }
                return typeof param === 'object' ? true : `Param ${system.index} not a object(${param}).`
            }
        },
        function: {
            check(param, system) {
                if (param == null && system.extras.abe === true) { return true }
                return typeof param === 'function' ? true : `Param ${system.index} not a function(${param}).`
            }
        },
        date: {
            check(value, system) {
                if (param == null && system.extras.abe === true) { return true }
                let date = new Date(value)
                return !isNaN(date.getTime()) ? true : `Param ${system.index} not a date(${param}).`
            },
            casting(value) {
                return (new Date(value)).getTime()
            }
        },
        required: {
            check(param, system) {
                return param != null ? true : `Param ${system.index} required.`
            }
        }
    }
}
