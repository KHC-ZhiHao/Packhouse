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
            sop: null,
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
        let sop = function(broadcast) {
            if (typeof broadcast === 'function') {
                supData.sop = broadcast
                return exps
            }
            this.$systemError('setSOP', 'SOP param not a function.', broadcast)
        }
        let unSop = function() {
            supData.sop = null
            return exps
        }
        let packing = function() {
            supData.package = supData.package.concat([...arguments])
            return exps
        }

        let unPacking = function() {
            supData.package = []
            return exps
        }
        return { ng, packing, unPacking, sop, unSop }
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

    createResponse({ error, success }, supports) {
        let over = false
        let doSop = function(context) {
            if (supports.sop) {
                supports.sop(context)
            }
        }
        return {
            error: (err) => {
                if (over) return
                over = true
                error(err)
                doSop({
                    success: false,
                    result: err
                })
            },
            success: (result) => {
                if (over) return
                over = true
                success(result)
                doSop({
                    success: true,
                    result: result
                })
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
        }, supports)
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
        }, supports)
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
            }, supports)
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
