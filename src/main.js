const Pump = require('./Pump')
const Factory = require('./Factory')

class Main {
    static createFactory() {
        return new Factory()
    }

    static createOrder(options) {
        return new Order(options)
    }

    static createPump(total, callback) {
        return new Pump(total, callback)
    }
}

module.exports = Main
