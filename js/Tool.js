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
     * @function initCatchData()
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
            direct: this.createLambda(this.direct, 'direct', support),
            action: this.createLambda(this.action, 'action', support),
            promise: this.createLambda(this.promise, 'promise', support)
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
                let args = new Array(this.argumentLength + 3)
                let length = this.argumentLength
                let callback = actionCallback(options)
                let packages = supports.package
                let packagesLength = packages.length
                for (let i = length; i--;) {
                    args[i] = i >= packagesLength ? options[i - packagesLength] : packages[i]
                }
                return call(args, callback, supports)
            }
        }
        return tool[name]
    }

    /**
     * @function getActionCallback
     * @private
     * @desc 解讀action的callback
     */

    getActionCallback(type) {
        if (type === 'action') {
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
