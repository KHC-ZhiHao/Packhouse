class OrderCore {
    constructor() {
        this.caches = new Map()
    }

    has(key) {
        if (typeof key !== 'string') {
            throw new Error('Key not a string.')
        }
        return this.caches.has(key)
    }

    get(key) {
        return this.caches.get(key)
    }

    clear() {
        this.caches.clear()
    }

    create(key) {
        this.caches.set(key, new Cache())
        return this.get(key)
    }

    remove(key) {
        if (this.has(key)) {
            this.caches.delete(key)
        } else {
            throw new Error(`Key(${key}) not found.`)
        }
    }

    getOrCreate(key) {
        return this.has(key) ? this.get(key) : this.create(key)
    }
}

class CacheCore {
    constructor(cache) {
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

    buffer({ error, success }) {
        this._core.buffer(error, success)
        return this
    }

    finish(callback) {
        this._core.finish(callback)
        return this
    }

    action(callback) {
        this._core.action(callback)
        return this
    }

    clear() {
        this._core.init()
        return this
    }
}

class Order {
    constructor() {
        this._core = new OrderCore()
    }

    has(key) {
        return this._core.has(key)
    }

    use(key, response, callback) {
        this._core
            .getOrCreate(key)
            .buffer(response)
            .finish(cache => cache.clear())
            .action(callback)
    }

    clear() {
        return this._core.clear()
    }

    remove(key) {
        return this._core.remove(key)
    }

    getOrCreat(key) {
        return this._core.getOrCreate(key)
    }
}

class Main {
    constructor(packhouse) {
        packhouse.utils.order = () => new Order()
    }
}

module.exports = Main
