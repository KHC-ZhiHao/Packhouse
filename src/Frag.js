const Base = require('./Base')

class FragCore extends Base {
    constructor(options = {}) {
        super('Frag')
        this.threads = []
        this.options = this.$verify(options, {
            limit: [false, ['number'], null]
        })
    }

    add(thread) {
        if (typeof thread !== 'function') {
            this.$systemError('add', 'Thread not a function.')
        }
        this.threads.push(thread)
    }

    clear() {
        this.threads = []
    }

    start(callback) {
        if (typeof callback !== 'function') {
            this.$systemError('start', 'Callback not a function.')
        }
        let now = 0
        let isStop = false
        let threads = this.threads.slice()
        let stop = () => {
            if (isStop === false) {
                callback()
                isStop = true
            }
        }
        let next = () => {
            if (isStop) {
                return null
            }
            let thread = threads.shift()
            if (thread) {
                now += 1
                thread(() => {
                    next()
                    now -= 1
                    if (now <= 0) {
                        stop()
                    }
                }, stop)
            }
        }
        let paraLength = this.options.limit ? this.options.limit : threads.length
        for (let i = 0; i < paraLength; i++) {
            next()
        }
    }
}

/**
 * 批次處裡的模型
 * @hideconstructor
 */

class Frag {
    constructor(options) {
        this._core = new FragCore(options)
    }

    /**
     * 加入指定一次執行續
     * @param {function} thread 執行續
     * @returns {this}
     */

    add(thread) {
        this._core.add(thread)
        return this
    }

    /**
     * 清空執行續
     */

    clear() {
        this._core.clear()
    }

    /**
     * 運行執行續
     * @param {function} callback 執行續結束後宣告
     */

    start(callback) {
        this._core.start(callback)
    }
}

module.exports = Frag
