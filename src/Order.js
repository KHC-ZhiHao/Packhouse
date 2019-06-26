const Base = require('./Base')

class OrderCore extends Base {
    constructor(options = {}) {
        super('Order')
        this.init()
        this.options = this.$verify(options, {
            max: [false, ['number'], 100]
        })
    }

    has(key) {
        if (typeof key !== 'string') {
            this.$systemError('has', 'Key not a string.', key)
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
            this.$systemError('remove', `Key(${key}) not found.`)
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

class Cache {
    constructor() {
        this._core = new CacheCore(this)
    }

    /**
     * 
     * @param {*} error 
     * @param {*} success 
     */

    buffer(error, success) {
        this._core.buffer(error, success)
        return this
    }

    /**
     * 
     * @param {*} callback 
     */

    finish(callback) {
        this._core.finish(callback)
        return this
    }

    /**
     * 
     */

    action(callback) {
        this._core.action(callback)
        return this
    }

    /**
     * 
     */

    clear() {
        this._core.init()
        return this
    }
}

class Order {
    constructor(options) {
        this._core = new OrderCore(options)
    }

    /**
     * 
     * @param {*} key 
     */

    has(key) {
        return this._core.has(key)
    }

    /**
     * 
     * @param {*} key 
     * @param {*} error 
     * @param {*} success 
     * @param {*} callback 
     */

    use(key, error, success, callback) {
        this._core
            .getOrCreate(key)
            .buffer(error, success)
            .finish(cache => cache.clear())
            .action(callback)
    }

    /**
     * 
     */

    clear() {
        return this._core.clear()
    }

    /**
     * 
     * @param {*} key 
     */

    remove(key) {
        return this._core.remove(key)
    }

    /**
     * 
     * @param {*} key 
     */

    getOrCreat(key) {
        return this._core.getOrCreate(key)
    }
}

module.exports = Order
