const Helper = require('./Helper')

class Probe {
    constructor() {
        this.id = Helper.createId()
        this.logs = []
        this.children = []
    }
}

module.exports = Probe
