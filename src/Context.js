const Utils = require('./Utils')

class Context {
    constructor(caller) {
        this.id = Utils.generateId()
        this.caller = caller
    }
}

module.exports = Context
