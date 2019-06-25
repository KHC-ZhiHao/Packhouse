module.exports = {
    defaultMolds: {
        number: {
            check(param, system) {
                if (param == null && system.extras[0] === 'abe') { return true }
                return typeof param === 'number' ? true : `Param ${system.index} not a number(${param}).`
            }
        },
        int: {
            check(param, system) {
                if (param == null && system.extras[0] === 'abe') { return true }
                return typeof param === 'number' ? true : `Param ${system.index} not a number(${param}).`
            },
            casting(param) {
                return Math.floor(param)
            }
        },
        string: {
            check(param, system) {
                if (param == null && system.extras[0] === 'abe') { return true }
                return typeof param === 'string' ? true : `Param ${system.index} not a string(${param}).`
            }
        },
        array: {
            check(param, system) {
                if (param == null && system.extras[0] === 'abe') { return true }
                return Array.isArray(param) ? true : `Param ${system.index} not a array(${param}).`
            }
        },
        object: {
            check(param, system) {
                if (param == null && system.extras[0] === 'abe') { return true }
                return typeof param === 'object' ? true : `Param ${system.index} not a object(${param}).`
            }
        },
        function: {
            check(param, system) {
                if (param == null && system.extras[0] === 'abe') { return true }
                return typeof param === 'function' ? true : `Param ${system.index} not a function(${param}).`
            }
        },
        required: {
            check(param, system) {
                return param != null ? true : `Param ${system.index} required.`
            }
        }
    }
}
