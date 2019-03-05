

    (function( root, factory ){
    
        let moduleName = 'Packhouse';
    
        if( typeof module !== 'undefined' && typeof exports === 'object' ) {
            module.exports = factory();
        }
        else if ( typeof define === 'function' && (define.amd || define.cmd) ) {
            define(function() { return factory; });
        } 
        else {
            root[moduleName] = factory();
        }
    
    })( this || (typeof window !== 'undefined' ? window : global), function(){
        /**
 * @class Functions
 * @desc Functions擔任Helper的腳色，專門放置靜態function
 */

class Functions {

    /**
     * @function getArgsLength(function)
     * @static
     * @desc 獲取函數的參數長度
     * @see https://stackoverflow.com/questions/42899083/get-function-parameter-length-including-default-params
     */

    static getArgsLength(func) {
        var funcStr = func.toString()
        var commaCount = 0
        var bracketCount = 0
        var lastParen = 0
        var inStrSingle = false
        var inStrDouble = false
        for (var i = 0; i < funcStr.length; i++) {
            if (['(', '[', '{'].includes(funcStr[i]) && !inStrSingle && !inStrDouble) {
                bracketCount++
                lastParen = i
            } else if ([')', ']', '}'].includes(funcStr[i]) && !inStrSingle && !inStrDouble) {
                bracketCount--
                if (bracketCount < 1) {
                    break;
                }
            } else if (funcStr[i] === "'" && !inStrDouble && funcStr[i - 1] !== '\\') {
                inStrSingle = !inStrSingle
            } else if (funcStr[i] === '"' && !inStrSingle && funcStr[i - 1] !== '\\') {
                inStrDouble = !inStrDouble
            } else if (funcStr[i] === ',' && bracketCount === 1 && !inStrSingle && !inStrDouble) {
                commaCount++
            }
        }
        if (commaCount === 0 && funcStr.substring(lastParen + 1, i).trim().length === 0) {
            return 0;
        }
        return commaCount + 1
    }
}
/**
 * @class ModuleBase
 * @desc 系統殼層
 */

class ModuleBase {

    constructor(name){
        this.$moduleBase = { 
            name: name || 'no name'
        };
    }

    /**
     * @function $systemError(functionName,maessage,object)
     * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
     */

    $systemError(functionName, message, object = '$_no_error'){
        if (object !== '$_no_error') {
            console.log('error data => ', object );
        }
        throw new Error(`(☉д⊙)!! PackHouse::${this.$moduleBase.name} => ${functionName} -> ${message}`);
    }

    $noKey( functionName, target, key ) {
        if( target[key] == null ){
            return true;
        } else {
            this.$systemError(functionName, `Name(${key}) already exists.`);
            return false;
        } 
    }

    $verify(data, validate, assign = {}) {
        let newData = {}
        for( let key in validate ){
            let v = validate[key];
            if( v[0] && data[key] == null ){
                this.$systemError('verify', 'Must required', key);
                return;
            }
            if( data[key] != null ){
                if( typeof v[1] === (typeof data[key] === 'string' && data[key][0] === "#") ? data[key].slice(1) : 'string' ){
                    newData[key] = data[key];
                } else {
                    this.$systemError('verify', `Type(${typeof v[1]}) error`, key);
                }
            } else {
                newData[key] = v[1];
            }
        }
        return Object.assign(newData, assign);
    }

}

class Case {}

/**
 * @class Packhouse
 * @desc 主核心
 */

class Packhouse extends ModuleBase {

    /**
     * @member {object} groups group的集結包
     * @member {function} bridge 每次請求時的一個呼叫函數
     */

    constructor() {
        super("Packhouse")
        this.groups = {}
        this.bridge = null
    }

    /**
     * @function createPublicMold(moldOptions)
     * @static
     * @desc 建立public mold
     */

    static createPublicMold(options) {
        let mold = new Mold(options)
        PublicMolds[mold.name] = mold
    }

    static createOrder() {
        let order = new Order()
        return order.exports
    }

    /**
     * @function asyncLoop(target,action,callback)
     * @static
     * @desc 非同步迴圈
     */

    static asyncLoop(target, action, callback) {
        if (Array.isArray(target) === false) {
            callback('AsyncLoop : Targrt not be array.')
            return
        }
        if (typeof action !== "function" || typeof callback !== "function") {
            callback('AsyncLoop : Action or callback not a function.')
            return
        }
        let length = target.length
        let onload = 0
        let onloadCallback = () => {
            onload += 1
            if (onload === length) {
                callback()
            }
        }
        let doing = async(target, index) => {
            action(target, index, onloadCallback)
        }
        for (let i = 0; i < length; i++) {
            doing(target[i], i)
        }
        if (length === 0) {
            callback()
        }
    }

    /**
     * @function getGroup(name)
     * @desc 獲取一個Group
     */

    getGroup(name) {
        if (this.hasGroup(name)) {
            return this.groups[name]
        } else {
            this.$systemError('getGroup', `Group(${name}) not found.`)
        }
    }

    /**
     * @function getTool(groupName,name)
     * @desc 獲取一個Tool
     */

    getTool(groupName, name) {
        return this.getGroup(groupName).getTool(name)
    }

    /**
     * @function getLine(groupName,name)
     * @desc 獲取一個Line
     */

    getLine(groupName, name) {
        return this.getGroup(groupName).getLine(name)
    }

    /**
     * @function addGroup(name,group,options)
     * @desc 加入一個Group
     * @param {object} options group被初始化時能夠接收到的外部物件
     */

    addGroup(name, group, options) {
        if (this.groups[name] != null){
            this.$systemError('addGroup', `Name(${name}) already exists.`)
            return
        }
        if ((group instanceof Group) === false) {
            this.$systemError('addGroup', 'Must group.', group)
            return
        }
        group.create(options)
        this.groups[name] = group
    }

    /**
     * @function hasGroup(name)
     * @desc 加入一個Group
     */

    hasGroup(name) {
        return !!this.groups[name]
    }

    /**
     * @function hasTool(groupName,name)
     * @desc 有無Tool
     */

    hasTool(groupName, name) {
        return !!this.getGroup(groupName).hasTool(name)
    }

    /**
     * @function hasLine(groupName,name)
     * @desc 有無Line
     */

    hasLine(groupName, name) {
        return !!this.getGroup(groupName).hasLine(name)
    }

    /**
     * @function tool(groupName,name)
     * @desc 呼叫一個tool
     */

    tool(groupName, name) {
        this.callBridge(groupName, name)
        return this.getTool(groupName, name).use()
    }

    /**
     * @function line(groupName,name)
     * @desc 呼叫一個line
     */

    line(groupName, name) {
        this.callBridge(groupName, name)
        return this.getLine(groupName, name).use()
    }

    /**
     * @function callBridge
     * @private
     * @desc 呼叫橋接器
     */

    callBridge(groupName, name) {
        if (this.bridge) {
            this.bridge(this, groupName, name)
        }
    }

    /**
     * @function setBridge
     * @desc 建立橋接器，在任何呼叫前執行一個function
     * @param {function} bridge 呼叫函式
     */

    setBridge(bridge) {
        if (typeof bridge === 'function') {
            this.bridge = bridge
        } else {
            this.$systemError('setBridge', 'Bridge not a function.', bridge)
        }
    }

}

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
            return this.caches[key]
        } else {
            this.$system('get', `Key(${key}) not found.`)
        }
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
        let cache = new OrderCache()
        this.caches[key] = cache.exports
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
/**
 * @class Tool
 * @desc Assembly的最小單位，負責執行指定邏輯
 * @argument options 實例化時可以接收以下參數
 * @param {string} name 模具名稱
 * @param {array} molds 模型組
 * @param {nubmer} updateTime update的指定時間(ms)
 * @param {number} paramLength 參數長度
 * @param {boolean} allowDirect 是否允許直接回傳
 * @param {function} create 首次使用該模具時呼叫
 * @param {function} update 每次呼叫達指定時間時，執行一次
 * @param {function} action 主要執行的function
 */

class Tool extends ModuleBase {

    /**
     * @member {Case} user this指向的位置，Case是一個空物件
     * @member {object} store 對外暴露的物件
     */

    constructor(options = {}, group, user) {
        super('Tool')
        this.user = user || new Case()
        this.store = {}
        this.group = group
        this.updateStamp = 0
        this.argumentLength = typeof options.paramLength === 'number' ? options.paramLength : -1
        this.data = this.$verify(options, {
            name: [true, ''],
            molds: [false, []],
            create: [false, function () {}],
            action: [true, '#function'],
            update: [false, function () {}],
            updateTime: [false, -1],
            allowDirect: [false, true]
        })
    }

    get name() { return this.data.name }

    /**
     * @function install
     * @private
     * @desc 當模具被第一次使用時呼叫
     */

    install() {
        this.initSystem()
        this.initArgLength()
        this.initCreate()
        this.initCatchData()
        this.updateStamp = Date.now()
        this.install = null
    }

    initCatchData() {
        this._moldLength = this.data.molds.length
        this._bindAction = this.data.action.bind(this.user)
    }

    /**
     * @function initCreate
     * @private
     * @desc 初始化create
     */

    initCreate() {
        this.data.create.call(this.user, this.store, this.system)
    }

    /**
     * @function checkUpdate
     * @private
     * @desc 判定是否要update
     */

    checkUpdate() {
        let ts = Date.now()
        let elapsed = ts - this.updateStamp
        if (elapsed > this.data.updateTime) {
            this.update()
        }
    }

    /**
     * @function update
     * @private
     * @desc 執行update
     */

    update() {
        this.data.update.call(this.user, this.store, this.system)
        this.updateStamp = Date.now()
    }

    /**
     * @function updateCall
     * @private
     * @desc 指定其他tool update
     */

    updateCall(target) {
        if (Array.isArray(target)) {
            for (let key of target) {
                this.group.updateCall(key)
            }
        } else {
            this.group.updateCall(target)
        }
    }

    /**
     * @function initSystem
     * @private
     * @desc 初始化系統接口
     */

    initSystem() {
        this.system = {
            coop: this.coop.bind(this),
            store: this.store,
            group: this.group.case,
            update: this.update.bind(this),
            include: this.include.bind(this),
            casting: this.parseMold.bind(this),
            updateCall: this.updateCall.bind(this)
        }
    }

    /**
     * @function initArgLength
     * @private
     * @desc 初始化參數長度
     */

    initArgLength() {
        if (this.argumentLength === -1) {
            this.argumentLength = Functions.getArgsLength(this.data.action) - 3
        }
        if (this.argumentLength < 0) {
            this.$systemError('initArgLength', 'Args length < 0', this.name + `(length:${this.argumentLength})`)
        }
    }

    /**
     * @function createExports
     * @private
     * @desc use tool時建構可使用的行為
     */

    createExports() {
        let supData = {
            noGood: null,
            package: []
        }
        let exps = {
            store: this.getStore.bind(this),
            direct: this.createLambda(this.direct, 'direct', supData),
            action: this.createLambda(this.action, 'action', supData),
            promise: this.createLambda(this.promise, 'promise', supData)
        }
        let supports = this.createSupport(exps, supData)
        return Object.assign(exps, supports)
    }

    /**
     * @function createSupport
     * @private
     * @desc 建立輔助方法
     */

    createSupport(exps, supData) {
        let ng = function(broadcast) {
            if (typeof broadcast === 'function') {
                supData.noGood = broadcast
                return exps
            }
            this.$systemError('setNG', 'NG param not a function.', broadcast)
        }
        let packing = function() {
            supData.package = supData.package.concat([...arguments])
            return exps
        }

        let unPacking = function() {
            supData.package = []
            return exps
        }
        return { ng, packing, unPacking }
    }

    /**
     * @function getError
     * @private
     * @desc 有鑑於有時候不會輸入錯誤訊息，但還是該回傳
     */

    getError(message) {
        return message || 'unknown error'
    }

    /**
     * @function createLambda
     * @private
     * @desc 封裝function，神奇的地方，同時也是可怕的效能吞噬者
     */

    createLambda(func, type, supports) {
        let name = Symbol(this.group.data.alias + '_' + this.name + '_' + type)
        let tool = {
            [name]: (...options) => {
                let args = []
                let length = this.argumentLength
                let params = supports.package.concat(options)
                let callback = null
                if (type === 'action') {
                    callback = params.pop()
                    if (typeof callback !== 'function') {
                        this.$systemError('createLambda', 'Action must a callback, no need ? try direct!')
                    }
                }
                for (let i = 0; i < length; i++) {
                    args[i] = params[i] || undefined
                }
                return func.call(this, args, callback, supports)
            }
        }
        return tool[name]
    }

    /**
     * @function parseMold
     * @desc 解讀Mold是否正確
     */

    parseMold(name, params, error) {
        let mold = this.group.getMold(name)
        let check = mold.check(params)
        if (check === true) {
            return mold.casting(params)
        } else {
            if (typeof error === 'function') {
                error(check)
            } else {
                this.$systemError('parseMold', check)
            }
        }
    }

    /**
     * @function include
     * @private
     * @desc 引入同Group的Tool
     */

    include(name) {
        return this.group.getTool(name).use()
    }

    /**
     * @function coop
     * @private
     * @desc 引入外部Group的接口
     */

    coop(name) {
        return this.group.getMerger(name)
    }

    /**
     * @function call
     * @private
     * @desc 呼叫自己的action
     */

    call(params, error, success) {
        // 驗證是否需要reset
        if (this.data.updateTime >= 0) {
            this.checkUpdate()
        }
        // 驗證參數是否使用mold
        let length = this._moldLength
        for (let i = 0; i < length; i++) {
            let name = this.data.molds[i]
            if (name) {
                params[i] = this.parseMold(name, params[i], error)
            }
        }
        // 執行action
        this._bindAction(...params, this.system, error, success)
    }

    /**
     * @function createResponse
     * @private
     * @desc 建構通用的success和error
     */

    createResponse({ error, success }) {
        let over = false
        return {
            error: (err) => {
                if (over) return
                over = true
                error(err)
            },
            success: (result) => {
                if (over) return
                over = true
                success(result)
            }
        }
    }

    /**
     * @function direct
     * @private
     * @desc 呼叫不須非同步的function
     */

    direct(params, callback, supports) {
        if (this.data.allowDirect === false) {
            this.$systemError('direct', `Tool(${this.data.name}) no allow direct.`)
        }
        let output = null
        let response = this.createResponse({
            error: (err) => {
                if (supports.noGood) {
                    supports.noGood(this.getError(err))
                } else {
                    throw new Error(this.getError(err))
                }
            },
            success: (result) => {
                output = result
            }
        })
        this.call(params, response.error, response.success)
        return output
    }

    /**
     * @function action
     * @private
     * @desc 宣告一個具有callback的function
     */

    action(params, callback = function () {}, supports) {
        let response = this.createResponse({
            error: (err) => {
                let message = this.getError(err)
                if (supports.noGood) {
                    supports.noGood(message)
                } else {
                    callback(message, null)
                }
            },
            success: (result) => {
                if (supports.noGood) {
                    callback(result)
                } else {
                    callback(null, result)
                }
            }
        })
        this.call(params, response.error, response.success)
    }

    /**
     * @function promise
     * @private
     * @desc 宣告一個promise
     */

    promise(params, callback, supports) {
        return new Promise((resolve, reject) => {
            let response = this.createResponse({
                error: (err) => {
                    let message = this.getError(err)
                    if (supports.noGood) {
                        supports.noGood(message)
                    }
                    reject(message)
                },
                success: (result) => {
                    resolve(result)
                }
            })
            this.call(params, response.error, response.success)
        })
    }

    /**
     * @function getStore
     * @private
     * @desc store的對外接口，只支援get
     */

    getStore(key) {
        if (this.store[key]) {
            return this.store[key]
        } else {
            this.$systemError('getStore', `Key(${key}) not found.`)
        }
    }

    /**
     * @function use
     * @private
     * @desc Group引用的接口
     */

    use() {
        if (this.install) { this.install() }
        return this.createExports()
    }

}

/**
 * @class Line
 * @desc Line是個累人的工程，複雜的建置，複雜的宣告，但辛苦會有結果的
 * @argument options 實例化時可以接收以下參數
 * @param {string} name 模具名稱
 * @param {array} inlet 進入口
 * @param {function} fail 失敗的回乎函數
 * @param {function} input 初始化的回乎函數
 * @param {function} output 輸出的回乎函數
 * @param {function} layout 能夠呼叫的function
 */

class Line extends ModuleBase {

    constructor(options, group) {
        super("Line");
        this.group = group;
        this.data = this.$verify(options, {
            name: [true, ''],
            fail: [true, '#function'],
            inlet: [false, []],
            input: [true, '#function'],
            output: [true, '#function'],
            layout: [true, {}]
        })
        this.inlet = this.data.inlet || null
        this.tools = {}
        this.checkPrivateKey()
    }

    get name() { return this.data.name }

    /**
     * @function checkPrivateKey
     * @private
     * @desc action, promise是不允許被放在layout的
     */

    checkPrivateKey() {
        let layout = this.data.layout
        if( layout.action || layout.promise ){
            this.$systemError('init', 'Layout has private key(action, promise)')
        }
    }

    /**
     * @function use
     * @private
     * @desc Line的對外接口
     */

    use() {
        let self = this
        return function() {
            let unit = new Deploy(self, [...arguments])
            return unit.getConveyer()
        }
    }

}

/**
 * @class Deploy
 * @desc Deploy是Line作為實際運行的物件
 */

class Deploy extends ModuleBase {

    /**
     * @member {array} flow 為放置行為的容器
     * @member {number} index
     */

    constructor(main, params) {
        super("Unit")
        this.case = new Case()
        this.flow = []
        this.main = main
        this.layout = main.data.layout
        this.params = params
        this.init()
    }

    /**
     * @function createTool
     * @private
     * @desc 實例化layout
     */

    createTool(name, action) {
        return (new Tool({ name, action }, this.main.group, this.case)).use()
    }

    /**
     * @function init
     * @private
     * @desc 初始化I/O
     */

    init() {
        this.input = this.createTool('input', this.main.data.input)
        this.output = this.createTool('output', this.main.data.output)
        this.initConveyer()
    }

    /**
     * @function initConveyer
     * @private
     * @desc 初始化輸送帶
     */

    initConveyer() {
        let self = this;
        this.conveyer = {
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }
        for (let name in this.layout) {
            this.conveyer[name] = function() {
                self.register(name, [...arguments])
                return self.getConveyer()
            }
        }
    }

    /**
     * @function getConveyer
     * @private
     * @desc 輸送帶的對外接口
     */

    getConveyer() {
        return this.conveyer
    }

    /**
     * @function register
     * @private
     * @desc 註冊一個flow
     */

    register(name, params) {
        if (this.main.inlet.length !== 0 && this.flow.length === 0) {
            if (!this.main.inlet.includes(name)) {
                this.$systemError('register', `First call method not inside inlet, you use'${name}'.`)
            }
        }
        let data = {
            name: name,
            method: this.createTool(name, this.layout[name]),
            params: params
        }
        this.flow.push(data)
    }

    /**
     * @function action
     * @private
     * @desc 執行有回乎函數的動作
     */

    action(callback) {
        let error = (error) => {
            this.main.data.fail(error, (report) => {
                callback(report, null)
            })
        }
        let success = (success) => {
            callback(null, success)
        }
        this.process(error, success)
    }

    /**
     * @function action
     * @private
     * @desc 執行回傳Promise的動作
     */

    promise() {
        return new Promise(( resolve, reject )=>{
            this.action((err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    /**
     * @function process
     * @private
     * @desc process是一個包裝執行過程的物件
     */

    process(error, success) {
        let rightNow = new Process(this.params, this.flow, this.input, this.output)
        rightNow.start(error, success)
    }

}

/**
 * @class Process
 * @desc process是一個包裝執行過程的物件
 */

class Process extends ModuleBase {

    constructor(params, flow, input, output) {
        super('Process')
        this.params = params
        this.stop = false
        this.flow = flow
        this.index = 0
        this.stack = []
        this.input = input
        this.output = output
    }

    /**
     * @function start
     * @private
     * @desc 執行Process
     */

    start(error, success) {
        this.error = error
        this.success = success
        this.stack.push('input')
        this.input.action(...this.params, (err) => {
            if (err) {
                this.fail(err)
            } else {
                this.next()
            }
        })
    }

    /**
     * @function finish
     * @private
     * @desc 執行output
     */

    finish() {
        this.stack.push('output')
        this.output.action((err, result) => {
            if (err) {
                this.fail(err)
            } else {
                this.success(result)
            }
        })
    }

    /**
     * @function createError
     * @private
     * @desc 建立錯誤與堆棧
     */

    createError(message) {
        return {
            message: message || 'unknown error',
            stack: this.stack
        }
    }

    /**
     * @function fail
     * @private
     * @desc 呼叫失敗
     */

    fail(message) {
        if (this.stop === false) {
            this.stop = true
            this.error(this.createError(message))
        }
    }

    /**
     * @function next
     * @private
     * @desc 執行下一個flow
     */

    next() {
        let flow = this.flow[this.index]
        if (flow && this.stop === false) {
            this.stack.push(flow.name)
            flow.method.action(...flow.params, (err) => {
                if (err) {
                    this.fail(err)
                } else {
                    this.index += 1
                    this.next()
                }
            })
        } else if (this.stop === false) {
            this.finish()
        }
    }

}
/**
 * @class Mold
 * @desc 參數配置器，能夠提供清晰的參數顯示
 * @argument options 實例化時可以接收以下參數
 * @param {string} name 模具名稱
 * @param {function} check 驗證參數是否通過，回傳true過，true以外皆不通過
 * @param {function} casting 回傳加工後的參數
 */

class Mold extends ModuleBase {

    constructor(options = {}) {
        super('Mold')
        this.case = new Case()
        this.data = this.$verify(options, {
            name: [true, ''],
            check: [false, function() { return true }],
            casting: [false, function (param) { return param }]
        })
    }

    get name() {
        return this.data.name
    }

    /**
     * @function check(param)
     * @private
     * @desc 驗證參數
     */

    check(param) {
        return this.data.check.call(this.case, param)
    }

    /**
     * @function casting(param)
     * @private
     * @desc 打模
     */

    casting(param) {
        return this.data.casting.call(this.case, param)
    }

}

let PublicMolds = {

    number: new Mold({
        name: 'number',
        check(param) {
            return typeof param === 'number' ? true : `Param(${param}) not a number.`
        }
    }),

    int: new Mold({
        name: 'int',
        check(param) {
            return typeof param === 'number' ? true : `Param(${param}) not a number.`
        },
        casting(param) {
            return Math.floor(param)
        }
    }),

    string: new Mold({
        name: 'string',
        check(param) {
            return typeof param === 'string' ? true : `Param(${param}) not a string.`
        }
    }),

    array: new Mold({
        name: 'array',
        check(param) {
            return Array.isArray(param) ? true : `Param(${param}) not a array.`
        }
    }),

    object: new Mold({
        name: 'object',
        check(param) {
            return typeof param === 'object' ? true : `Param(${param}) not a object.`
        }
    }),

    function: new Mold({
        name: 'function',
        check(param) {
            return typeof param === 'function' ? true : `Param(${param}) not a function.`
        }
    })

}
/**
 * @class Group
 * @desc 封裝tool的群組，用於歸類與參數設定
 * @argument options 實例化時可以接收以下參數
 * @param {string} alias Group別名
 * @param {object} merger 引用的外部Group
 * @param {function} create 首次使用該Group時呼叫
 */

class Group extends ModuleBase {

    constructor(options = {}) {
        super("Group")
        this.case = new Case()
        this.linebox = {}
        this.moldbox = {}
        this.toolbox = {}
        this.data = this.$verify(options, {
            alias: [false, 'no_alias_group'],
            merger: [false, {}],
            create: [false, function(){}]
        })
        this.initStatus()
        this.initMerger()
    }

    /**
     * @function initStatus()
     * @private
     * @desc 初始化狀態
     */

    initStatus() {
        this.status = {
            created: false
        }
    }

    /**
     * @function initMerger()
     * @private
     * @desc 檢查Merger是否正確
     */

    initMerger() {
        for (let key in this.data.merger) {
            let group = this.data.merger[key]
            if ((group instanceof Group) === false) {
                this.$systemError('initMerger', `The '${key}' not a group.`)
            }
        }
    }

    /**
     * @function alone()
     * @desc 回傳一個獨立的呼叫接口
     */

    alone(options) {
        this.create(options)
        return {
            tool: this.callTool.bind(this),
            line: this.callLine.bind(this)
        }
    }

    /**
     * @function create
     * @private
     * @desc 當Group首次宣告alone或引入factory時呼叫
     */

    create(options) {
        if (this.status.created === false) {
            this.data.create.bind(this.case)(options)
            this.status.created = true
        }
    }

    /**
     * @function getTool
     * @private
     * @param {string} name 獲取Group內的Tool
     */

    getTool(name) {
        if (this.toolbox[name]) {
            return this.toolbox[name]
        } else {
            this.$systemError('getTool', `Tool(${name}) not found.`)
        }
    }

    /**
     * @function getLine
     * @private
     * @param {string} name 獲取Group內的Line
     */

    getLine(name) {
        if (this.linebox[name]) {
            return this.linebox[name]
        } else {
            this.$systemError('getLine', `Line(${name}) not found.`)
        }
    }

    /**
     * @function getMold
     * @private
     * @param {string} name 獲取Group內的Mold
     */

    getMold(name) {
        let mold = this.moldbox[name] || PublicMolds[name] || null
        if (mold) {
            return mold
        } else {
            this.$systemError('getMold', `Mold(${name}) not found.`)
        }
    }

    /**
     * @function getMerger
     * @private
     * @param {string} name 獲取Group Merger對象宣告的alone
     */

    getMerger(name) {
        if (this.data.merger[name]) {
            return this.data.merger[name].alone()
        } else {
            this.$systemError('getMerger', `Merger(${name}) not found.`)
        }
    }

    /**
     * @function callTool
     * @private
     * @param {string} name 使用Group的Tool
     */

    callTool(name) {
        return this.getTool(name).use()
    }

    /**
     * @function callLine
     * @private
     * @param {string} name 使用Group的Tool
     */

    callLine(name) {
        return this.getLine(name).use()
    }

    /**
     * @function addMold
     * @desc 加入一個模具
     * @param {object} options 建立mold所需要的物件
     */

    addMold(options) {
        let mold = new Mold(options)
        if (this.$noKey('addMold', this.moldbox, mold.name)) {
            this.moldbox[mold.name] = mold
        }
    }

    /**
     * @function addMolds
     * @desc 加入多個模塊
     * @param {array} molds 建立mold所需要多個物件
     */

    addMolds(molds) {
        if (Array.isArray(molds)) {
            for (let mold of molds) {
                this.addMold(mold)
            }
        } else {
            this.$systemError('addMolds', 'Molds not a array.', molds)
        }
    }

    /**
     * @function addLine
     * @desc 加入一個產線
     * @param {object} options 建立line所需要的物件
     */

    addLine(options){
        let line = new Line(options, this)
        if (this.$noKey('addLine', this.linebox, line.name)) {
            this.linebox[line.name] = line
        }
    }

    /**
     * @function addTool
     * @desc 加入一個工具
     * @param {object} options 建立tool所需要的物件
     */

    addTool(options) {
        let tool = new Tool(options, this)
        if( this.$noKey('addTool', this.toolbox, tool.name ) ){
            this.toolbox[tool.name] = tool
        }
    }

    /**
     * @function addTools
     * @desc 加入多個工具
     * @param {array} tools 建立tool所需要多個物件
     */

    addTools(tools) {
        if (Array.isArray(tools)) {
            for (let tool of tools) {
                this.addTool(tool)
            }
        } else {
            this.$systemError('addTools', 'Tools not a array.', tools)
        }
    }

    /**
     * @function hasTool
     * @desc getTool失敗會擲出錯誤，使用這支function來檢查此問題
     * @param {string} name 搜尋目標line的name
     */

    hasTool(name) {
        return !!this.toolbox[name]
    }

    /**
     * @function hasLine
     * @desc getLine失敗會擲出錯誤，使用這支function來檢查此問題
     * @param {string} name 搜尋目標line的name
     */

    hasLine(name) {
        return !!this.linebox[name]
    }

    /**
     * @function hasMold
     * @desc getMode失敗會擲出錯誤，使用這支function來檢查此問題
     * @param {string} name 搜尋目標mold的name
     */

    hasMold(name) {
        return !!this.moldbox[name]
    }

    /**
     * @function updateCall
     * @desc 指定tool update
     */

    updateCall(name) {
        this.getTool(name).update()
    }

}

            let __re = Packhouse;
            __re.Group = Group;

            return __re;
        
    })
