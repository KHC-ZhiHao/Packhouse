const Base = require('./Base')
const Utils = require('./Utils')

class OrderCore extends Base {
    constructor(options = {}) {
        super('Order')
        this.init()
        this.options = Utils.verify(options, {
            max: [false, ['number'], 100]
        })
    }

    has(key) {
        if (typeof key !== 'string') {
            this.$devError('has', 'Key not a string.', key)
        }
        return !!this.caches[key]
    }

    get(key) {
        if (this.has(key) === false) {
            this.$system('get', `Key(${key}) not found.`)
        }
        return this.caches[key]
    }

    init() {
        this.keys = []
        this.caches = {}
        this.length = 0
    }

    clear() {
        this.init()
    }

    create(key) {
        this.keys.push(key)
        this.length += 1
        this.caches[key] = new Cache()
        if (this.length > this.options.max) {
            this.remove(this.keys[0])
        }
        return this.get(key)
    }

    remove(key) {
        if (this.has(key)) {
            this.length -= 1
            delete this.caches[this.keys.shift()]
        } else {
            this.$devError('remove', `Key(${key}) not found.`)
        }
    }

    getOrCreate(key) {
        return this.has(key) ? this.get(key) : this.create(key)
    }
}

class CacheCore extends Base {
    constructor(cache) {
        super('Cache')
        this.init()
        this.buffers = []
        this.exports = cache
        this.finishCallback = () => {}
    }

    init() {
        this.mode = null
        this.over = false
        this.result = null
    }

    post() {
        while (this.buffers.length > 0) {
            let buffer = this.buffers.pop()
            buffer[this.mode](this.result)
        }
    }

    buffer(error, success) {
        this.buffers.push({ error, success })
        if (this.over) { this.post() }
    }

    finish(callback) {
        this.finishCallback = callback
    }

    action(callback) {
        if (this.over === false) {
            callback(this.setError.bind(this), this.setSuccess.bind(this))
        }
    }

    set(mode, result) {
        this.mode = mode
        this.over = true
        this.result = result
        this.post()
        this.finishCallback(this.exports)
    }

    setError(result) {
        this.set('error', result)
    }

    setSuccess(result) {
        this.set('success', result)
    }
}

/**
 * 快取物件
 * @hideconstructor
 */

class Cache {
    constructor() {
        this._core = new CacheCore(this)
    }

    /**
     * 註冊一組緩衝
     * @param {function} error 如果這個快取是觸發錯誤時觸發
     * @param {function} success 如果這個快取是成功時觸發
     */

    buffer(error, success) {
        this._core.buffer(error, success)
        return this
    }

    /**
     * 當快取被註冊時觸發一次
     * @param {function():cache} callback 觸發的function
     */

    finish(callback) {
        this._core.finish(callback)
        return this
    }

    /**
     * 當快取沒有被註冊時由此事件觸發
     * @param {function(error,success):cache} callback 觸發的function
     */

    action(callback) {
        this._core.action(callback)
        return this
    }

    /**
     * 清空註冊狀態
     */

    clear() {
        this._core.init()
        return this
    }
}

/**
 * 管理快取的事件
 * @hideconstructor
 */

class Order {
    constructor(options) {
        this._core = new OrderCore(options)
    }

    /**
     * 有無該key的快取狀態
     * @param {string} key 指定cache
     * @returns {boolean}
     */

    has(key) {
        return this._core.has(key)
    }

    /**
     * 使用cache
     * @param {string} key 指定cache
     * @param {OrderError} error buffer error
     * @param {OrderSuccess} success buffer success
     * @param {OrderCallback} callback action callback
     */

    use(key, error, success, callback) {
        this._core
            .getOrCreate(key)
            .buffer(error, success)
            .finish(cache => cache.clear())
            .action(callback)
    }

    /**
     * 清空所有cache
     */

    clear() {
        return this._core.clear()
    }

    /**
     * 清空指定cache
     * @param {string} key 指定cache
     */

    remove(key) {
        return this._core.remove(key)
    }

    /**
     * 建立或獲取快取物件
     * @param {string} key 指定cache
     */

    getOrCreat(key) {
        return this._core.getOrCreate(key)
    }
}

module.exports = Order
