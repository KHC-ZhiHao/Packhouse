const Helper = require('./Helper')

class Base {
    constructor(name) {
        this._base = {
            name: name || 'no name'
        }
    }

    $systemError(functionName, message, object = 'no_error') {
        if (object !== 'no_error') {
            console.log('error data => ', object)
        }
        throw new Error(`(☉д⊙)!! PackHouse::${this._base.name} => ${functionName} -> ${message}`)
    }

    $verify(data, validates) {
        let newData = {}
        for (let key in validates) {
            let target = data[key]
            let validate = validates[key]
            let required = validate[0]
            let types = validate[1]
            let defaultValue = validate[2]
            let type = Helper.getType(target)
            if (Helper.getType(required) !== 'boolean') {
                throw new Error(`Helper::verify => Required must be a boolean`)
            }
            if (Helper.getType(types) !== 'array') {
                throw new Error(`Helper::verify => Types must be a array`)
            }
            if (required && target == null) {
                throw new Error(`Helper::verify => Key(${key}) is required`)
            }
            if (types && target != null && !types.includes(type)) {
                throw new Error(`Helper::verify => Type(${key}::${type}) error, need ${types.join(' or ')}`)
            }
            newData[key] = target || defaultValue
        }
        return newData
    }
}

module.exports = Base
