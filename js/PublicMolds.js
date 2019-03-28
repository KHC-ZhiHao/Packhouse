let PublicMolds = {

    number: new Mold({
        name: 'number',
        check(param, system) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'number' ? true : `Param ${system.index} not a number(${param}).`
        }
    }),

    int: new Mold({
        name: 'int',
        check(param) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'number' ? true : `Param ${system.index} not a number(${param}).`
        },
        casting(param) {
            return Math.floor(param)
        }
    }),

    string: new Mold({
        name: 'string',
        check(param) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'string' ? true : `Param ${system.index} not a string(${param}).`
        }
    }),

    array: new Mold({
        name: 'array',
        check(param) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return Array.isArray(param) ? true : `Param ${system.index} not a array(${param}).`
        }
    }),

    object: new Mold({
        name: 'object',
        check(param) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'object' ? true : `Param ${system.index} not a object(${param}).`
        }
    }),

    function: new Mold({
        name: 'function',
        check(param) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'function' ? true : `Param ${system.index} not a function(${param}).`
        }
    })

}
