const Pump = require('./Pump')
const Order = require('./Order')
const Factory = require('./Factory')

class Main {
    static createFactory() {
        return new Factory()
    }

    static createPump(total, callback) {
        return new Pump(total, callback)
    }

    static createOrder(options) {
        return new Order(options)
    }
}

module.exports = Main
