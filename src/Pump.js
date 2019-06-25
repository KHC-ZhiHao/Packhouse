const Base = require('./Base')

class PumpCore extends Base {
    constructor(total, callback) {
        super('Pump')
        this.count = 0
        this.options = this.$verify({ total, callback }, {
            total: [true, ['number']],
            callback: [true, ['function']]
        })
    }

    press() {
        this.count += 1
        if (this.count >= this.options.total) {
            this.options.callback()
        }
        return this.count
    }

    add(count) {
        let type = typeof count
        if (count != null && type !== 'number') {
            this.$systemError('add', 'Count not a number.', number)
        }
        if (type === 'number' && count < 0) {
            this.$systemError('add', 'Count cannot be negative.', number)
        }
        this.options.total += count
        return this.options.total
    }

    each(callback) {
        if (typeof callback !== 'function') {
            this.$systemError('each', 'Callback not a function', callback)
        }
        let press = this.press.bind(this)
        for (let i = this.count; i < this.options.total; i++) {
            callback(press, this.count)
        }
    }
}

class Pump {
    constructor() {
        this._core = new PumpCore()
    }

    add(count) {
        return this._core.add(count)
    }
    each(callback) {
        return this._core.each(callback)
    }
    press() {
        return this._core.press()
    }
}

module.exports = Pump
