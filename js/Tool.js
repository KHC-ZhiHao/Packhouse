/**
 * @class Tool
 * @desc Assembly的最小單位，負責執行指定邏輯
 * @argument options 實例化時可以接收以下參數
 * @param {string} name 模具名稱
 * @param {array} molds 模型組
 * @param {number} paramLength 參數長度
 * @param {boolean} allowDirect 是否允許直接回傳
 * @param {function} create 首次使用該模具時呼叫
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
        this.argumentLength = typeof options.paramLength === 'number' ? options.paramLength : -1
        this.data = this.$verify(options, {
            name: [true, ''],
            molds: [false, []],
            create: [false, function () {}],
            action: [true, '#function'],
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
        this.install = null
        this.data.create.bind(this.user)(this.store, {
            group: this.group.case,
            include: this.include.bind(this)
        })
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
            include: this.include.bind(this)
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
     * @desc 建立輔助方法，應該找機會把它獨立出來ˊOuOˋ
     */

    createSupport(exps, supData) {
        return {
            ng: function(broadcast) {
                if (typeof broadcast === 'function') {
                    supData.noGood = broadcast
                    return exps
                }
                this.$systemError('createSupport', 'NG param not a function.', broadcast)
            },
            packing: function() {
                supData.package = supData.package.concat([...arguments])
                return exps
            },
            unPacking: function() {
                supData.package = []
                return exps
            }
        }
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
     * @desc 封裝function，Assembly神奇的地方，同時也是可怕的效能吞噬者
     */

    createLambda(func, type, supports) {
        let self = this
        let name = Symbol(this.group.data.alias + '_' + this.name + '_' + type)
        let tool = {
            [name]: function() {
                let params = supports.package.concat([...arguments])
                let callback = null
                if (type === 'action') {
                    if (typeof params.slice(-1)[0] === 'function') {
                        callback = params.pop()
                    } else {
                        self.$systemError('createLambda', 'Action must a callback, no need ? try direct!')
                    }
                }
                let args = new Array(self.argumentLength)
                for (let i = 0; i < args.length; i++) {
                    args[i] = params[i] || undefined
                }
                return func.bind(self)(args, callback, supports)
            }
        }
        return tool[name]
    }

    parseMold(params, index, error) {
        let name = this.data.molds[index]
        if (name) {
            let mold = this.group.getMold(name)
            let check = mold.check(params)
            if (check === true) {
                return mold.casting(params)
            } else {
                error(check)
            }
        }
        return params
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
        for (let i = 0; i < params.length; i++) {
            params[i] = this.parseMold(params[i], i, error)
        }
        this.data.action.call(this.user, ...params, this.system, error, success)
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
            this.$systemError('direct', 'Not allow direct.', this.data.name)
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
            this.$systemError('getStore', 'Key not found.', key)
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
