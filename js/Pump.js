/**
 * @class Pump
 * @desc 方便計算函數的物件
 */

class Pump extends ModuleBase {

    constructor(total, callback) {
        super('Pump')
        this.count = 0
        this.options = this.$verify({ total, callback }, {
            total: [true, ['number']],
            callback: [true, ['function']]
        })
        this.exports = {
            add: this.add.bind(this),
            each: this.each.bind(this),
            press: this.press.bind(this)
        }
    }

    /**
     * @function press
     * @desc 加一點數
     */

    press() {
        this.count += 1
        if (this.count >= this.options.total) {
            this.options.callback()
        }
        return this.count
    }

    /**
     * @function add
     * @desc 增加一點總和
     */

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

    /**
     * @function each
     * @desc 瀝遍所有點數
     */

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
