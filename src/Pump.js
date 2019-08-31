const Base = require('./Base')
const Utils = require('./Utils')

class PumpCore extends Base {
    constructor(total, finish) {
        super('Pump')
        this.count = 0
        this.options = Utils.verify({ total, finish }, {
            total: [true, ['number']],
            finish: [true, ['function']]
        })
    }

    press() {
        this.count += 1
        if (this.count >= this.options.total) {
            this.options.finish()
        }
        return this.count
    }

    add(count) {
        let type = typeof count
        if (count != null && type !== 'number') {
            this.$devError('add', 'Count not a number.', number)
        }
        if (type === 'number' && count < 0) {
            this.$devError('add', 'Count cannot be negative.', number)
        }
        this.options.total += count
        return this.options.total
    }

    each(callback) {
        if (typeof callback !== 'function') {
            this.$devError('each', 'Callback not a function', callback)
        }
        let press = this.press.bind(this)
        for (let i = this.count; i < this.options.total; i++) {
            callback(press, this.count)
        }
    }
}

/**
 * 非同步loop的解決方案
 * @hideconstructor
 */

class Pump {
    constructor(total, finish) {
        this._core = new PumpCore(total, finish)
    }

    /**
     * 加入指定次數
     * @param {number} [count=1] 指定次數
     * @returns {number} 總計數
     */

    add(count) {
        return this._core.add(count)
    }

    /**
     * 根據剩餘次數宣告callback，該方法並不會消耗次數
     * @param {PumpEachCallback} callback 宣告的方法
     */

    each(callback) {
        return this._core.each(callback)
    }

    /**
     * 加一次記數，當計數大於指定次數，呼叫finish
     * @returns {number} 當下累計計數
     */

    press() {
        return this._core.press()
    }
}

module.exports = Pump
