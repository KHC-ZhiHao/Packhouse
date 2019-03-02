let PublicMolds = {

    number: new Mold({
        name: 'number',
        check(param) {
            return typeof param === 'number' ? true : `Param(${param}) not a number.`
        }
    }),

    int: new Mold({
        name: 'int',
        check(param) {
            return typeof param === 'number' ? true : `Param(${param}) not a number.`
        },
        casting(param) {
            return Math.floor(param)
        }
    }),

    string: new Mold({
        name: 'string',
        check(param) {
            return typeof param === 'string' ? true : `Param(${param}) not a string.`
        }
    }),

    array: new Mold({
        name: 'array',
        check(param) {
            return Array.isArray(param) ? true : `Param(${param}) not a array.`
        }
    }),

    object: new Mold({
        name: 'object',
        check(param) {
            return typeof param === 'object' ? true : `Param(${param}) not a object.`
        }
    }),

    function: new Mold({
        name: 'function',
        check(param) {
            return typeof param === 'function' ? true : `Param(${param}) not a function.`
        }
    })

}