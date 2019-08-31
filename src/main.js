const utils = require('./Utils')

/**
 * Packhouse export
 * @hideconstructor
 */

class Main {
    /**
     * 建立一個factory
     * @see {@link Factory}
     */

    static createFactory() {
        return new Factory()
    }

    /**
     * 建立一個Pump
     * @param {number} total 目標次數
     * @param {function} finish 達目標次數時觸發
     * @see {@link Pump}
     */

    static createPump(total, finish) {
        return new Pump(total, finish)
    }

    /**
     * 建立一個Order
     * @param {object} [options]
     * @param {number} [options.max=100] 最大快取量，超過會移除舊的並加入新的快取
     * @see {@link Order}
     */

    static createOrder(options) {
        return new Order(options)
    }
}

Main.utils = utils

module.exports = Main

const Pump = require('./Pump')
const Order = require('./Order')
const Factory = require('./Factory')

Main.Pump = Main
Main.Order = Order
Main.Factory = Factory
