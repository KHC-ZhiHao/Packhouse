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
     * 建立一個Step
     * @param {object} optnios step所需要的參數
     * @param {number} [optnios.timeout] 以ms計數到timeout後擲出timeout message
     * @param {function} [options.mixin] 可攔截template並回傳加工項目
     * @param {function} optnios.input 通用起始點處裡參數
     * @param {function} optnios.middle 中介層處理狀態
     * @param {function} optnios.finish 擲出exit或fail和執行template完畢後都會呼叫此函數
     * @see {@link Step}
     * @example
     * const step = Packhouse.createStep({
     *      mixin(templates, options) { return [].concat(templates) },
     *      input(args, options, { exit, fail }) {},
     *      middle({ exit, fail, lastCall, nextCall }) {},
     *      output({ success, message, history }) {}
     * })
     */

    static createStep(optnios) {
        return new Step(optnios)
    }

    /**
     * 建立一個Frag
     * @param {object} [options]
     * @param {number} [options.limit=1] 並行運行數量
     * @see {@link Frag}
     */

    static createFrag(options) {
        return new Frag(options)
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

module.exports = Main

const Frag = require('./Frag')
const Pump = require('./Pump')
const Step = require('./Step')
const Order = require('./Order')
const Factory = require('./Factory')
