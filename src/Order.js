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
    constructor() {
        super('Cache')
        this.mode = null
        this.ready = false
        this.loaded = false
        this.result = null
        this.buffers = []
        this.onloadBuffers = []
    }

    post() {
        while (this.buffers.length > 0) {
            let buffer = this.buffers.pop()
            if (this.mode === 'success') {
                buffer.success(this.result)
            } else {
                buffer.error(this.result)
            }
        }
    }

    buffer(error, success) {
        this.buffers.push({ error, success })
    }

    isReady() {
        return !!this.ready
    }

    onReady(callback) {
        if (this.isReady() === false) {
            this.ready = true
            callback(this.setError.bind(this), this.setSuccess.bind(this))
        }
    }

    onload(callback) {
        if (this.loaded) {
            callback(this.exports)
        } else {
            this.onloadBuffers.push(callback)
        }
        return this.exports
    }

    postOnload() {
        while (this.onloadBuffers.length > 0) {
            let callback = this.onloadBuffers.pop()
            callback(this.exports)
        }
    }

    set(mode, result) {
        if (this.loaded === false) {
            this.mode = mode
            this.loaded = true
            this.result = result
            this.postOnload()
        }
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
        this._core = new CacheCore()
    }

    post() {
        return this._core.post()
    }

    buffer(error, success) {
        this._core.buffer(error, success)
        return this
    }

    onload(callback) {
        this._core.onload(callback)
        return this
    }

    isReady() {
        return this._core.isReady()
    }

    onReady(callback) {
        return this._core.onReady(callback)
    }
}

class Order {
    constructor(options) {
        this._core = new OrderCore(options)
    }

    has(key) {
        return this._core.has(key)
    }

    get(key) {
        return this._core.get(key)
    }

    use(key, error, success, callback) {
        this.getOrCreate(key)
            .buffer(error, success)
            .onload(cache => {
                cache.post()
                this.clear()
            })
            .onReady(callback)
    }

    clear() {
        return this._core.clear()
    }

    create(key) {
        return this._core.create(key)
    }

    remove(key) {
        return this._core.remove(key)
    }

    getOrCreat(key) {
        return this._core.getOrCreate(key)
    }
}

module.exports = Order
