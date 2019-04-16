

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

class Case {}
class ModuleBase {

    constructor(name){
        this.$moduleBase = { 
            name: name || 'no name'
        };
    }

    /**
     * @function $systemError(functionName,maessage,object)
     * @private
     * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
     */

    $systemError(functionName, message, object = '$_no_error'){
        if (object !== '$_no_error') {
            console.log('error data => ', object )
        }
        throw new Error(`(☉д⊙)!! PackHouse::${this.$moduleBase.name} => ${functionName} -> ${message}`)
    }

    /**
     * @function $noKey(functionName,maessage,object)
     * @private
     * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
     */

    $noKey(functionName, target, key) {
        if (target[key] == null) {
            return true
        } else {
            this.$systemError(functionName, `Name(${key}) already exists.`)
            return false
        } 
    }

    /**
     * @function $verify
     * @private
     * @desc 驗證格式是否正確
     */

    $verify(data, validates, assign = {}) {
        let newData = {}
        for (let key in validates) {
            let validate = validates[key]
            let required = validate[0]
            let type = validate[1]
            let defaultValue = validate[2]
            if (required && data[key] == null) {
                this.$systemError('verify', `Key(${key}) is required`)
            }
            if (type && data[key] != null && !type.includes(typeof data[key])) {
                this.$systemError('verify', `Type(${key}::${typeof data[key]}) error, need ${type.join(' or ')}`)
            }
            newData[key] = data[key] || defaultValue
        }
        return Object.assign(newData, assign)
    }

    /**
     * @function $protection
     * @private
     * @desc 保護物件不被修改
     */

    $protection(data) {
        return new Proxy(data, {
            set: (target, key) => this.$systemError('$protection', `Key(${key}) is protection`, target)
        })
    }

}

/**
 * @class Packhouse
 * @desc 主核心，實體化名為Factory
 */

class Packhouse extends ModuleBase {

    /**
     * @member {object} groups group的集結包
     * @member {function} bridge 每次請求時的一個呼叫函數
     */

    constructor(options = {}) {
        super("Packhouse")
        this.groups = {}
        this.bridge = null
        if (options.bridge) {
            this.setBridge(options.bridge)
        }
    }

    /**
     * @function createPublicMold(moldOptions)
     * @static
     * @desc 建立public mold
     */

    static createPublicMold(options) {
        let mold = new Mold(options)
        if (PublicMolds[mold.name]) {
            throw new Error(`(☉д⊙)!! PackHouse::createPublicMold -> Public mold name(${mold.name}) already exists.`)
        } else {
            PublicMolds[mold.name] = mold
        }
    }

    /**
     * @function createOrder(options)
     * @static
     * @desc 建立一個order
     */

    static createOrder(options) {
        let order = new Order(options)
        return new OrderExports(order)
    }

    /**
     * @function createGroup(options)
     * @static
     * @desc 建立一個Group
     */

    static createGroup(options) {
        let group = new Group(options)
        return new GroupExports(group)
    }

    /**
     * @function createFactory(options)
     * @static
     * @desc 建立一個Factory
     */

    static createFactory(options) {
        let factory = new Packhouse(options)
        return new FactoryExports(factory)
    }

    /**
     * @function isFactory(factory)
     * @static
     * @desc 確認是一個Factory
     */

    static isFactory(factory) {
        return factory instanceof Packhouse || factory instanceof FactoryExports
    }

    /**
     * @function isGroup(group)
     * @static
     * @desc 確認是一個Group
     */

    static isGroup(group) {
        return Group.isGroup(group)
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
     * @function createPump(total,callback)
     * @static
     * @desc 建立計數幫浦
     */

    static createPump(total, callback) {
        return (new Pump(total, callback)).exports
    }

    /**
     * @function getGroup(name)
     * @private
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
     * @private
     * @desc 獲取一個Tool
     */

    getTool(groupName, name) {
        return this.getGroup(groupName).callTool(name)
    }

    /**
     * @function getLine(groupName,name)
     * @private
     * @desc 獲取一個Line
     */

    getLine(groupName, name) {
        return this.getGroup(groupName).callLine(name)
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
        if (Group.isGroup(group) === false) {
            this.$systemError('addGroup', 'Must group.', group)
            return
        }
        if (group.isModule()) {
            this.$systemError('addGroup', 'Group id module, only use alone or in the merger.', group)
            return
        }
        group.create(options)
        this.groups[name] = group
    }

    /**
     * @function removeGroup(name)
     * @desc 移除一個Group
     */

    removeGroup(name) {
        if (this.groups[name]) {
            this.groups[name] = null
        } else {
            this.$systemError('removeGroup', `Group(${name}) not found.`)
        }
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
        return this.getTool(groupName, name)
    }

    /**
     * @function line(groupName,name)
     * @desc 呼叫一個line
     */

    line(groupName, name) {
        this.callBridge(groupName, name)
        return this.getLine(groupName, name)
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

    constructor(options = {}) {
        super('Order')
        this.init()
        this.options = this.$verify(options, {
            max: [false, ['number'], 1000]
        })
    }

    /**
     * @function init()
     * @private
     * @desc 初始化數據
     */

    init() {
        this.keys = []
        this.caches = {}
        this.length = 0
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
        this.init()
    }

    /**
     * @function create()
     * @desc 建立一個cache
     */

    create(key) {
        this.length += 1
        this.keys.push(key)
        this.caches[key] = new OrderCache()
        if (this.length > this.options.max) {
            this.remove(this.keys[0])
        }
        return this.get(key)
    }

    /**
     * @function remove(key)
     * @desc 指定移除一個快取
     */

    remove(key) {
        if (this.has(key)) {
            this.length -= 1
            delete this.caches[this.keys.shift()]
        } else {
            this.$systemError('remove', `Key(${key}) not found.`)
        }
    }

    /**
     * @function getOrCreate()
     * @desc 獲取一個快取，如果沒有則建立
     */

    getOrCreate(key) {
        return this.has(key) ? this.get(key) : this.create(key)
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
 * @class Response
 * @desc 控制result的class
 */

class Response {

    constructor(group, supports) {
        this.sop = supports.sop
        this.over = false
        this.group = group
        this.welds = null
        this.exports = {
            error: this.error.bind(this),
            success: this.success.bind(this)
        }
        if (supports.welds.length > 0) {
            this.welds = supports.welds.slice()
        }
        if (supports.noGood) {
            this.noGood = supports.noGood.action
            this.noGoodOptions = supports.noGood.options
        }
    }

    /**
     * @function getError
     * @private
     * @desc 獲取錯誤狀態
     */

    getError(message) {
        return message || 'unknown error'
    }

    /**
     * @function error
     * @desc 宣告錯誤狀態
     */

    error(result) {
        if (this.over === false) {
            this.over = true
            this.errorBase(result)
            this.callSop({ result, success: false })
        }
    }

    /**
     * @function success
     * @desc 宣告成功狀態
     */

    success(result, context) {
        if (this.over === false) {
            this.over = true
            this.runWeld(result, (result) => {
                this.successBase(result, context)
                this.callSop({ result, success: true })
            })
        }
    }

    /**
     * @function runWeld
     * @private
     * @desc 運行Weld
     */

    runWeld(result, callback) {
        if (this.welds == null) {
            callback(result)
            return null
        }
        let weld = this.welds.pop()
        if (weld) {
            let tool = this.group.callTool(weld.tool)
            weld.packing(result, tool.packing)
            tool.ng(this.noGood, this.noGoodOptions)
                .action((result) => {
                    this.runWeld(result, callback)
                })
        } else {
            callback(result)
        }
    }

    /**
     * @function callSop
     * @private
     * @desc 呼叫sup
     */

    callSop(context) {
        if (this.sop) {
            this.sop(context)
        }
    }

}

/**
 * @class ResponseDirect
 * @desc Direct的Response模型
 */

class ResponseDirect extends Response {

    constructor(group, supports) {
        super(group, supports)
        this.result = null
    }

    /**
     * @function errorBase
     * @private
     * @desc 專屬的錯誤執行殼層
     */

    errorBase(result) {
        if (this.noGood) {
            this.noGood(this.getError(result))
        } else {
            throw new Error(this.getError(result))
        }
    }

    /**
     * @function successBase
     * @private
     * @desc 專屬的成功執行殼層
     */

    successBase(result) {
        this.result = result
    }

}

/**
 * @class ResponseAction
 * @desc Action的Response模型
 */

class ResponseAction extends Response {

    constructor(group, supports, callback) {
        super(group, supports)
        this.callback = callback || function () {}
    }

    /**
     * @function errorBase
     * @private
     * @desc 專屬的錯誤執行殼層
     */

    errorBase(result) {
        let message = this.getError(result)
        if (this.noGood) {
            this.noGood(message)
        } else {
            this.callback(message, null)
        }
    }

    /**
     * @function successBase
     * @private
     * @desc 專屬的成功執行殼層
     */

    successBase(result) {
        if (this.noGood) {
            this.callback(result)
        } else {
            this.callback(null, result)
        }
    }

}

/**
 * @class ResponseRecursive
 * @desc Recursive的Response模型
 */

class ResponseRecursive extends ResponseAction {

    /**
     * @function successBase
     * @private
     * @desc 專屬的成功執行殼層
     */

    successBase(result, context) {
        if (this.noGood) {
            this.callback(result, context)
        } else {
            this.callback(null, result, context)
        }
    }

}

/**
 * @class ResponsePromise
 * @desc Promise的Response模型
 */

class ResponsePromise extends Response {

    constructor(group, supports, resolve, reject) {
        super(group, supports)
        this.resolve = resolve
        this.reject = reject
    }

    /**
     * @function errorBase
     * @private
     * @desc 專屬的錯誤執行殼層
     */

    errorBase(result) {
        let message = this.getError(result)
        if (this.noGood) {
            this.noGood(message)
        }
        if (this.noGood && this.noGoodOptions.resolve) {
            this.resolve(message)
        } else {
            this.reject(message)
        }
    }

    /**
     * @function successBase
     * @private
     * @desc 專屬的成功執行殼層
     */

    successBase(result) {
        this.resolve(result)
    }

}
/**
 * @class Support
 * @desc 建立tool後的Exports的攜帶物件
 */

class Support extends ModuleBase {

    constructor() {
        super('Support')
        this.sop = null
        this.welds = []
        this.noGood = null
        this.package = []
        this.exports = null
    }

    /**
     * @function createExports
     * @private
     * @desc 擲出Exports
     */

    createExports(lambdas) {
        this.exports = {
            ...lambdas,
            ng: this.setNoGood.bind(this),
            unNg: this.unNoGood.bind(this),
            sop: this.setSop.bind(this),
            rule: this.setRule.bind(this),
            unSop: this.unSop.bind(this),
            weld: this.addWeld.bind(this),
            clear: this.clear.bind(this),
            unWeld: this.unWeld.bind(this),
            packing: this.addPacking.bind(this),
            rePacking: this.rePacking.bind(this),
            unPacking: this.unPacking.bind(this)
        }
        return this.exports
    }

    /**
     * @function copy
     * @private
     * @desc 當lambda被執行後要拷貝狀態
     */

    copy() {
        return {
            sop: this.sop,
            welds: this.welds.slice(),
            noGood: this.noGood,
            package: this.package.slice()
        }
    }

    /**
     * @function addWeld
     * @desc 加入一則Weld
     */

    addWeld(tool, packing) {
        this.welds.push({ tool, packing })
        return this.exports
    }

    /**
     * @function unWeld
     * @desc 移除所有Weld
     */

    unWeld() {
        this.welds = []
        return this.exports
    }

    /**
     * @function setRule
     * @desc 設置規則
     */

    setRule(noGood, sop, options) {
        if (noGood) {
            this.setNoGood(noGood, options)
        }
        if (sop) {
            this.setSop(sop)
        }
        return this.exports
    }

    /**
     * @function setNoGood
     * @desc 設置ng
     */

    setNoGood(action, options = {}) {
        if (typeof action === 'function') {
            this.noGood = {
                action: action,
                options: this.$verify(options, {
                    resolve: [false, ['boolean'], false]
                })
            }
            return this.exports
        }
        this.$systemError('setNG', 'NG param not a function.', action)
    }

    /**
     * @function unNoGood
     * @desc 移除ng
     */

    unNoGood() {
        this.noGood = null
        return this.exports
    }

    /**
     * @function setSop
     * @desc 設置sop
     */

    setSop(action) {
        if (typeof action === 'function') {
            this.sop = action
            return this.exports
        }
        this.$systemError('setSOP', 'SOP param not a function.', action)
    }

    /**
     * @function unSop
     * @desc 移除sop
     */

    unSop() {
        this.sop = null
        return this.exports
    }

    /**
     * @function addPacking
     * @desc 加入一則預參數
     */

    addPacking() {
        this.package = this.package.concat([...arguments])
        return this.exports
    }

    /**
     * @function rePacking
     * @desc unPacking後再Packing的綜合體
     */
 
    rePacking() {
        this.package = [...arguments]
        return this.exports
    }

    /**
     * @function unPacking
     * @desc 移除所有預參數
     */

    unPacking() {
        this.package = []
        return this.exports
    }

    /**
     * @function clear
     * @desc 移除所有參數
     */

    clear() {
        this.unNoGood()
        this.unSop()
        this.unWeld()
        this.unPacking()
        return this.exports
    }

}

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
        this.exportStore = this.group.data.secure ? this.$protection(this.store) : this.store
        this.argumentLength = typeof options.paramLength === 'number' ? options.paramLength : -1
        this.data = this.$verify(options, {
            name: [true, ['string']],
            molds: [false, ['object'], []],
            create: [false, ['function'], function () {}],
            action: [true, ['function']],
            update: [false, ['function'], function () {}],
            updateTime: [false, ['number'], -1],
            description: [false, ['string'], ''],
            allowDirect: [false, ['boolean'], true]
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

    /**
     * @function initCatchData
     * @private
     * @desc 快取一些資源協助優化
     */

    initCatchData() {
        this.moldLength = this.data.molds.length
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
     * @function getProfile
     * @desc 獲取tool的資料
     */

    getProfile() {
        return {
            name: this.data.name,
            molds: this.data.molds,
            description: this.data.description,
            allowDirect: this.data.allowDirect
        }
    }

    /**
     * @function replace
     * @desc 取代自定義項目
     */

    replace(options) {
        this.data = this.$verify(options, {
            molds: [false, ['object'], this.data.molds],
            create: [false, ['function'], this.data.create],
            action: [false, ['function'], this.data.action],
            update: [false, ['function'], this.data.update],
            updateTime: [false, ['number'], this.data.updateTime],
            description: [false, ['string'], this.data.description],
            allowDirect: [false, ['boolean'], this.data.allowDirect]
        })
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
        if (this.install) { this.install() }
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
            tool: this.useTool.bind(this),
            line: this.useLine.bind(this),
            store: this.exportStore,
            group: this.group.exportCase,
            update: this.update.bind(this),
            include: this.useTool.bind(this),
            casting: this.casting.bind(this),
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
        let support = new Support()
        let exports = {
            store: this.getStore.bind(this),
            replace: this.replace.bind(this),
            direct: this.createLambda(this.direct, 'direct', support),
            action: this.createLambda(this.action, 'action', support),
            promise: this.createLambda(this.promise, 'promise', support),
            recursive: this.createLambda(this.recursive, 'recursive', support)
        }
        return support.createExports(exports)
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

    createLambda(func, type, support) {
        let name = Symbol(this.group.data.alias + '_' + this.name + '_' + type)
        let call = func.bind(this)
        let actionCallback = this.getActionCallback(type)
        let tool = {
            [name]: (...options) => {
                let supports = support.copy()
                let callback = actionCallback(options)
                let args = this.createArgs(options, supports)
                return call(args, callback, supports)
            }
        }
        return tool[name]
    }

    /**
     * @function createArgs
     * @private
     * @desc 將參數轉換成PK可用參數
     */

    createArgs(options, supports) {
        let args = new Array(this.argumentLength + 3)
        let length = this.argumentLength
        let packages = supports.package
        let packagesLength = packages.length
        for (let i = length; i--;) {
            args[i] = i >= packagesLength ? options[i - packagesLength] : packages[i]
        }
        return args
    }

    /**
     * @function getActionCallback
     * @private
     * @desc 解讀action的callback
     */

    getActionCallback(type) {
        if (type === 'action' || type === 'recursive') {
            return (params) => {
                let callback = params.pop()
                if (typeof callback !== 'function') {
                    this.$systemError('createLambda', 'Action must a callback.')
                }
                return callback
            }
        } else {
            return function() { return null }
        }
    }

    /**
     * @function parseMold
     * @private
     * @desc 解讀Mold是否正確
     */

    parseMold(name, params, error, system) {
        let mold = this.group.getMold(name)
        let check = mold.check(params, system)
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
     * @function casting
     * @private
     * @desc 從system引用的casting接口
     */

    casting(name, data, callback) {
        let split = name.split('|')
        let call = split.shift()
        let type = 'system'
        let index = 0
        let extras = split
        let caller = this.name
        this.parseMold(call, data, callback, { type, index, extras, caller })
    }

    /**
     * @function useTool
     * @private
     * @desc 引入同Group的Tool
     */

    useTool(name) {
        return this.group.callTool(name)
    }

    /**
     * @function useLine
     * @private
     * @desc 引入同Group的Line
     */

    useLine(name) {
        return this.group.callLine(name)
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
        let moldLength = this.moldLength
        for (let i = 0; i < moldLength; i++) {
            if (this.data.molds[i] == null) {
                continue
            }
            let split = this.data.molds[i].split('|')
            let name = split.shift()
            if (name) {
                params[i] = this.parseMold(name, params[i], error, {
                    type: 'call',
                    index: i,
                    extras: split,
                    caller: this.name
                })
            }
        }
        // 執行action
        let paramLength = params.length - 3
        params[paramLength] = this.system
        params[paramLength + 1] = error
        params[paramLength + 2] = success
        this.data.action.apply(this.user, params)
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
        if (supports.welds.length > 0) {
            this.$systemError('direct', `Tool(${this.data.name}) use weld, can do direct.`)
        }
        let response = new ResponseDirect(this.group, supports)
        this.call(params, response.exports.error, response.exports.success)
        return response.result
    }

    /**
     * @function action
     * @private
     * @desc 宣告一個具有callback的function
     */

    action(params, callback, supports) {
        let response = (new ResponseAction(this.group, supports, callback)).exports
        this.call(params, response.error, response.success)
    }


    /**
     * @function recursive
     * @private
     * @desc 基於action的遞迴函數
     */

    recursive(params, callback, supports, count = -1) {
        count += 1
        let stack = (...params) => { this.recursive(this.createArgs(params, supports), callback, supports, count) }
        let response = (new ResponseRecursive(this.group, supports, callback)).exports
        this.call(params, response.error, result => response.success(result, { count, stack }))
    }

    /**
     * @function promise
     * @private
     * @desc 宣告一個promise
     */

    promise(params, callback, supports) {
        return new Promise((resolve, reject) => {
            let response = (new ResponsePromise(this.group, supports, resolve, reject)).exports
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
        this.tools = {}
        this.group = group
        this.data = this.$verify(options, {
            name: [true, ['string']],
            fail: [true, ['function']],
            inlet: [false, ['object'], null],
            input: [true, ['object', 'function']],
            output: [true, ['object', 'function']],
            layout: [true, ['object']]
        })
        this.layoutKeys = Object.keys(this.data.layout)
        this.checkPrivateKey()
    }

    get name() { return this.data.name }

    /**
     * @function getProfile()
     * @desc 獲取line的資料
     */

    getProfile() {
        return {
            name: this.data.name,
            inlet: this.data.inlet,
            layouts: Object.keys(this.data.layout)
        }
    }

    /**
     * @function checkPrivateKey
     * @private
     * @desc action, promise, setRule是不允許被放在layout的
     */

    checkPrivateKey() {
        let layout = this.data.layout
        if (layout.action || layout.promise || layout.setRule) {
            this.$systemError('init', 'Layout has private key(action, promise, setRule)')
        }
    }

    /**
     * @function use
     * @private
     * @desc Line的對外接口
     */

    use() {
        return (...options) => {
            return (new Deploy(this, options)).conveyer
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
        this.supports = new Support()
        this.init()
    }

    /**
     * @function createTool
     * @private
     * @desc 實例化layout
     */

    createTool(name, target, nonTool) {
        if (typeof target === 'function') {
            return (new Tool({ name, action: target }, this.main.group, this.case)).use()
        } else if (nonTool) {
            this.$systemError('createTool', `${name} not a function.`)
        } else {
            if (target.name) {
                delete target.name
            }
            return (new Tool({ name, ...target }, this.main.group, this.case)).use()
        }
    }

    /**
     * @function init
     * @private
     * @desc 初始化I/O
     */

    init() {
        this.input = this.createTool('input', this.main.data.input)
        this.output = this.createTool('output', this.main.data.output, true)
        this.initConveyer()
    }

    /**
     * @function initConveyer
     * @private
     * @desc 初始化輸送帶
     */

    initConveyer() {
        this.conveyer = {
            action: this.action.bind(this),
            promise: this.promise.bind(this),
            setRule: this.setRule.bind(this)
        }
        for (let name of this.main.layoutKeys) {
            this.conveyer[name] = (...options) => {
                this.register(name, options)
                return this.conveyer
            }
        }
    }

    /**
     * @function register
     * @private
     * @desc 註冊一個flow
     */

    register(name, params) {
        let inlet = this.main.data.inlet
        if (inlet && inlet.length !== 0 && this.flow.length === 0) {
            if (inlet.includes(name) === false) {
                this.$systemError('register', `First call method not inside inlet, you use '${name}'.`)
            }
        }
        this.flow.push({
            name: name,
            method: this.createTool(name, this.layout[name]),
            params: params
        })
    }

    /**
     * @function action
     * @private
     * @desc 執行有回乎函數的動作
     */

    action(callback) {
        let fail = this.main.data.fail
        let supports = this.supports.copy()
        let response = (new ResponseAction(this.main.group, supports, callback)).exports
        this.process(error => fail(error, response.error), response.success)
    }

    /**
     * @function action
     * @private
     * @desc 執行回傳Promise的動作
     */

    promise() {
        return new Promise(( resolve, reject ) => {
            let fail = this.main.data.fail
            let supports = this.supports.copy()
            let response = (new ResponsePromise(this.main.group, supports, resolve, reject)).exports
            this.process(error => fail(error, response.error), response.success)
        })
    }

    /**
     * @function setRule
     * @private
     * @desc 效力等同rule(ng, sop, ngOptions)
     */

    setRule(...options) {
        this.supports.setRule(...options)
        return this.conveyer
    }

    /**
     * @function process
     * @private
     * @desc process是一個包裝執行過程的物件
     */

    process(error, success) {
        (new Process(this.params, this.flow, this.input, this.output)).start(error, success)
    }

}

/**
 * @class Process
 * @desc process是一個包裝執行過程的物件
 */

class Process extends ModuleBase {

    constructor(params, flow, input, output) {
        super('Process')
        this.stop = false
        this.flow = flow
        this.index = 0
        this.stack = []
        this.input = input
        this.params = params
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
        this.input.ng(e => this.fail(e)).action(...this.params, this.next.bind(this))
    }

    /**
     * @function finish
     * @private
     * @desc 執行output
     */

    finish() {
        this.stack.push('output')
        this.output.ng(e => this.fail(e)).action(this.success)
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
        if (this.stop === true) { return }
        let flow = this.flow[this.index]
        if (flow) {
            this.stack.push(flow.name)
            flow.method.ng(e => this.fail(e)).action(...flow.params, () => {
                this.index += 1
                this.next()
            })
        } else {
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
            name: [true, ['string']],
            check: [false, ['function'], function() { return true }],
            casting: [false, ['function'], function (param) { return param }],
            description: [false, ['string'], '']
        })
    }

    get name() {
        return this.data.name
    }

    /**
     * @function getProfile()
     * @desc 獲取mold的資料
     */

    getProfile() {
        return {
            name: this.data.name,
            description: this.data.description
        }
    }

    /**
     * @function check(param,system)
     * @private
     * @desc 驗證參數
     */

    check(param, system) {
        return this.data.check.call(this.case, param, system)
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
        check(param, system) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'number' ? true : `Param ${system.index} not a number(${param}).`
        }
    }),

    int: new Mold({
        name: 'int',
        check(param, system) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'number' ? true : `Param ${system.index} not a number(${param}).`
        },
        casting(param) {
            return Math.floor(param)
        }
    }),

    string: new Mold({
        name: 'string',
        check(param, system) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'string' ? true : `Param ${system.index} not a string(${param}).`
        }
    }),

    array: new Mold({
        name: 'array',
        check(param, system) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return Array.isArray(param) ? true : `Param ${system.index} not a array(${param}).`
        }
    }),

    object: new Mold({
        name: 'object',
        check(param, system) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'object' ? true : `Param ${system.index} not a object(${param}).`
        }
    }),

    function: new Mold({
        name: 'function',
        check(param, system) {
            if (param == null && system.extras[0] === 'abe') { return true }
            return typeof param === 'function' ? true : `Param ${system.index} not a function(${param}).`
        }
    }),

    required: new Mold({
        name: 'required',
        check(param, system) {
            return param != null ? true : `Param ${system.index} required.`
        }
    })

}

/**
 * @class Group
 * @desc 封裝tool的群組，用於歸類與參數設定
 * @argument options 實例化時可以接收以下參數
 * @param {string} alias Group別名
 * @param {object} merger 引用的外部Group
 * @param {boolean} module 使否為模組
 * @param {boolean} secure 是否使用安全模式
 * @param {function} create 首次使用該Group時呼叫
 */

class Group extends ModuleBase {

    constructor(options = {}) {
        super("Group")
        this.case = new Case()
        this.data = this.$verify(options, {
            alias: [false, ['string'], 'no_alias_group'],
            module: [false, ['boolean'], false],
            secure: [false, ['boolean'], false],
            merger: [false, ['object'], {}],
            create: [false, ['function'], function(){}]
        })
        this.toolbox = {}
        this.moldbox = {}
        this.linebox = {}
        this.initStatus()
        this.initMerger()
    }

    static isGroup(group) {
        return group instanceof Group || group instanceof GroupExports
    }

    /**
     * @function getProfile()
     * @desc 獲取group的資料
     */

    getProfile() {
        let profile = {
            line: {},
            mold: {},
            tool: {},
            alias: this.data.alias
        }
        for (let key in this.toolbox) {
            profile.tool[key] = this.getTool(key).getProfile()
        }
        for (let key in this.moldbox) {
            profile.mold[key] = this.getMold(key).getProfile()
        }
        for (let key in this.linebox) {
            profile.line[key] = this.getLine(key).getProfile()
        }
        return profile
    }

    /**
     * @function compileLazy
     * @desc 由此實現懶加載的驗證
     */

    compileLazy(name, target, module) {
        if (typeof target[name] === 'function') {
            target[name] = new module({ name, ...target[name]() }, this)
        }
        return target[name]
    }

    /**
     * @function replace(name,optnios)
     * @desc 使否為模組狀態
     */

    replaceTool(name, optnios) {
        let tool = this.getTool(name)
        tool.replace(optnios)
    }

    /**
     * @function isModule()
     * @private
     * @desc 使否為模組狀態
     */

    isModule() {
        return this.data.module
    }

    /**
     * @function initStatus()
     * @private
     * @desc 初始化狀態
     */

    initStatus() {
        this.exportCase = this.data.secure ? this.$protection(this.case) : this.case
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
            if (Group.isGroup(group) === false && typeof group !== 'function') {
                this.$systemError('initMerger', `The '${key}' not a group or function.`)
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
        if (options && this.isModule()) {
            this.$systemError('create', `Module mode can't use options`)
        }
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
            return this.compileLazy(name, this.toolbox, Tool)
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
            return this.compileLazy(name, this.linebox, Line)
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
            if (typeof this.data.merger[name] === 'function') {
                let group = this.data.merger[name]()
                if (Group.isGroup(group) === false) {
                    this.$systemError('getMerger', `The '${name}' not a group.`)
                }
                this.data.merger[name] = group
            }
            return this.data.merger[name].alone()
        } else {
            this.$systemError('getMerger', `Merger(${name}) not found.`)
        }
    }

    /**
     * @function callTool
     * @param {string} name 使用Group的Tool
     */

    callTool(name) {
        return this.getTool(name).use()
    }

    /**
     * @function callLine
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
     * @param {object|array} molds 建立mold所需要多個物件
     */

    addMolds(molds) {
        if (Array.isArray(molds)) {
            for (let mold of molds) {
                this.addMold(mold)
            }
            return true
        }
        if (typeof molds === 'object') {
            for (let key in molds) {
                this.addMold({ name: key, ...molds[key] })
            }
            return true
        }
        this.$systemError('addMolds', 'Molds not a array or object.', molds)
    }

    /**
     * @function addLine
     * @desc 加入一個產線
     * @param {object} options 建立line所需要的物件
     */

    addLine(...options){
        if (typeof options[0] === 'string') {
            this.addLineLazy(options[0], options[1])
        } else {
            let line = new Line(options[0], this)
            if (this.$noKey('addLine', this.linebox, line.name)) {
                this.linebox[line.name] = line
            }
        }
    }

    /**
     * @function addLineLazy
     * @private
     * @desc 用懶加載模式加入一個產線
     */

    addLineLazy(name, callback) {
        if (typeof callback === 'function') {
            if (this.$noKey('addLineLazy', this.linebox, name)) {
                this.linebox[name] = callback
            }
        } else {
            this.$systemError('addLineLazy', 'Callback not a function.')
        }
    }

    /**
     * @function addLines
     * @desc 加入多個產線
     * @param {object|array} options 建立line所需要的物件
     */

    addLines(lines){
        if (Array.isArray(lines)) {
            for (let line of lines) {
                this.addLine(line)
            }
            return true
        }
        if (typeof lines === 'object') {
            for (let key in lines) {
                if (typeof lines[key] === 'function') {
                    this.addLineLazy(name, lines[key])
                } else {
                    this.addLine({ name: key, ...lines[key] })
                }
            }
            return true
        }
        this.$systemError('addLines', 'Lines not a array or object.', lines)
    }

    /**
     * @function addTool
     * @desc 加入一個工具
     * @param {object} options 建立tool所需要的物件
     */

    addTool(...options) {
        if (typeof options[0] === 'string') {
            this.addToolLazy(options[0], options[1])
        } else {
            let tool = new Tool(options[0], this)
            if (this.$noKey('addTool', this.toolbox, tool.name)) {
                this.toolbox[tool.name] = tool
            }
        }
    }

    /**
     * @function addToolLazy
     * @private
     * @desc 用懶加載模式加入一個工具
     */

    addToolLazy(name, callback) {
        if (typeof callback === 'function') {
            if (this.$noKey('addToolLazy', this.toolbox, name)) {
                this.toolbox[name] = callback
            }
        } else {
            this.$systemError('addToolLazy', 'Callback not a function.')
        }
    }

    /**
     * @function addTools
     * @desc 加入多個工具
     * @param {object|array} tools 建立tool所需要多個物件
     */

    addTools(tools) {
        if (Array.isArray(tools)) {
            for (let tool of tools) {
                this.addTool(tool)
            }
            return true
        }
        if (typeof tools === 'object') {
            for (let key in tools) {
                if (typeof tools[key] === 'function') {
                    this.addToolLazy(name, tools[key])
                } else {
                    this.addTool({ name: key, ...tools[key] })
                }
            }
            return true
        }
        this.$systemError('addTools', 'Tools not a array or object.', tools)
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
     * @private
     * @desc 指定tool update
     */

    updateCall(name) {
        this.getTool(name).update()
    }

}
class FactoryExports {

    constructor(factory) {
        this.line = factory.line.bind(factory)
        this.tool = factory.tool.bind(factory)
        this.hasLine = factory.hasLine.bind(factory)
        this.hasTool = factory.hasTool.bind(factory)
        this.addGroup = factory.addGroup.bind(factory)
        this.hasGroup = factory.hasGroup.bind(factory)
        this.setBridge = factory.setBridge.bind(factory)
        this.removeGroup = factory.removeGroup.bind(factory)
    }

}

class GroupExports {

    constructor(group) {
        this.alone = group.alone.bind(group)
        this.create = group.create.bind(group)
        this.hasTool = group.hasTool.bind(group)
        this.hasMold = group.hasMold.bind(group)
        this.hasLine = group.hasLine.bind(group)
        this.addMold = group.addMold.bind(group)
        this.addLine = group.addLine.bind(group)
        this.addTool = group.addTool.bind(group)
        this.addMolds = group.addMolds.bind(group)
        this.addTools = group.addTools.bind(group)
        this.callTool = group.callTool.bind(group)
        this.callLine = group.callLine.bind(group)
        this.isModule = group.isModule.bind(group)
        this.getProfile = group.getProfile.bind(group)
    }

}

class OrderExports {

    constructor(order) {
        this.has = order.has.bind(order)
        this.get = order.get.bind(order)
        this.list = order.list.bind(order)
        this.clear = order.clear.bind(order)
        this.create = order.create.bind(order)
        this.remove = order.remove.bind(order)
        this.getOrCreate = order.getOrCreate.bind(order)
    }

}

            let __re = Packhouse;
            __re.Group = Group;

            return __re;
        
    })
