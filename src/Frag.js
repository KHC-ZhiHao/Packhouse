const Base = require('./Base')

class FragCore extends Base {
    constructor(options = {}) {
        super('Frag')
        this.threads = []
        this.options = this.$verify(options, {
            parallel: [false, ['number'], null]
        })
    }

    add(thread) {
        if (typeof thread !== 'function') {
            this.$systemError('add', 'Thread not a function.')
        }
        this.threads.push(thread)
    }

    each(items, callback) {
        for (let i = 0; i < items.length; i++) {
            this.add((done, stop) => {
                callback(items[i], i, done, stop)
            })
        }
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
        let result = {
            stop: null,
            done: []
        }
        let stop = (message) => {
            if (isStop === false) {
                result.stop = message
                callback(result)
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
                thread((message) => {
                    next()
                    result.done.push(message)
                    now -= 1
                    if (now <= 0) {
                        stop()
                    }
                }, stop)
            }
        }
        let parallelLength = this.options.parallel ? this.options.parallel : threads.length
        for (let i = 0; i < parallelLength; i++) {
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
     * 批次加入執行續
     * @param {array} items 執行續
     * @returns {this}
     */

    each(items, callback) {
        this._core.each(items, callback)
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
