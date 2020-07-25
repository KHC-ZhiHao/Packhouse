class Base {
    constructor(name) {
        this._base = { name }
    }

    $devError(functionName, message, object = 'no_error') {
        if (object !== 'no_error') {
            console.log('error data => ', object)
        }
        throw new Error(`(☉д⊙)!! PackHouse::${this._base.name} => ${functionName} -> ${message}`)
    }

    $systemError(functionName, message, object = 'no_error') {
        if (object !== '$_no_error') {
            console.log('error data => ', object)
        }
        console.error('Please take this error message to : https://github.com/KHC-ZhiHao/Packhouse/issues/new')
        throw new Error(`(☉д⊙)!! System Error, PackHouse::${this._base.name} => ${functionName} -> ${message}`)
    }
}

module.exports = Base
