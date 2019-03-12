/**
 * @class Order
 * @desc 緩衝與快取物件
 */

class Order extends ModuleBase {

    constructor() {
        super('Order')
        this.caches = {}
        this.exports = {
            has: this.has.bind(this),
            get: this.get.bind(this),
            list: this.list.bind(this),
            clear: this.clear.bind(this),
            create: this.create.bind(this),
            getOrCreate: this.getOrCreate.bind(this)
        }
    }

    /**
     * @function has(key)
     * @desc 有無這份cache
     */

    has(key) {
        if (typeof key === 'string') {
            return !!this.caches[key]
        } else {
            this.$systemError('has', 'Key not a string.', key)
        }
    }

    /**
     * @function get(key)
     * @desc 獲取cache
     */

    get(key) {
        if (this.has(key)) {
            return this.caches[key].exports
        } else {
            this.$system('get', `Key(${key}) not found.`)
        }
    }

    /**
     * @function list()
     * @desc 獲取cache map
     */

    list() {
        let map = {}
        for (let key of this.caches) {
            map[key] = this.caches[key].result
        }
        return map
    }

    /**
     * @function clear()
     * @desc 清空cache
     */

    clear() {
        this.caches = {}
    }

    /**
     * @function create()
     * @desc 建立一個cache
     */

    create(key) {
        this.caches[key] = new OrderCache()
        return this.get(key)
    }

    /**
     * @function getOrCreate()
     * @desc 獲取一個快取，如果沒有則建立
     */

    getOrCreate(key) {
        if (this.has(key)) {
            return this.get(key)
        } else {
            return this.create(key)
        }
    }

}

/**
 * @class OrderCache
 * @desc 快取物件
 */

class OrderCache extends ModuleBase {

    constructor() {
        super('OrderCache')
        this.mode = null
        this.ready = false
        this.loaded = false
        this.onloadBuffers = []
        this.result = null
        this.buffers = []
        this.exports = {
            post: this.post.bind(this),
            buffer: this.buffer.bind(this),
            onload: this.onload.bind(this),
            isReady: this.isReady.bind(this),
            onReady: this.onReady.bind(this)
        }
    }

    /**
     * @function post()
     * @desc 推播所有buffer
     */

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

    /**
     * @function buffer(error,success)
     * @desc 加入一個緩衝
     */

    buffer(error, success) {
        this.buffers.push({ error, success })
        return this.exports
    }

    /**
     * @function isReady()
     * @desc 是否被宣告過載入
     */

    isReady() {
        return !!this.ready
    }

    /**
     * @function onReady(callback)
     * @desc 沒有快取，宣告載入
     */

    onReady(callback) {
        if (this.isReady() === false) {
            this.ready = true
            callback(this.setError.bind(this), this.setSuccess.bind(this))
        } else {
            this.$systemError('onReady', 'This cache is ready, use order.clear() reset cache.')
        }
    }

    /**
     * @function onload(callback)
     * @desc 監聽是否已經快取，已經快取完畢則執行，否則等待快取完畢後執行
     */

    onload(callback) {
        if (this.loaded) {
            callback(this.exports)
        } else {
            this.onloadBuffers.push(callback)
        }
        return this.exports
    }

    /**
     * @function postOnload()
     * @private
     * @desc 等待快取仔入完畢後，推播所有的onload事件
     */

    postOnload() {
        while (this.onloadBuffers.length > 0) {
            let callback = this.onloadBuffers.pop()
            callback(this.exports)
        }
    }

    /**
     * @function set(mode,result)
     * @private
     * @desc 設定快取資料
     */

    set(mode, result) {
        if (this.loaded === false) {
            this.mode = mode
            this.loaded = true
            this.result = result
            this.postOnload()
        }
    }

    /**
     * @function setError(result)
     * @private
     * @desc 這次的快取是個錯誤
     */

    setError(result) {
        this.set('error', result)
    }

    /**
     * @function setSuccess(result)
     * @private
     * @desc 這次的快取是成功的
     */

    setSuccess(result) {
        this.set('success', result)
    }

}