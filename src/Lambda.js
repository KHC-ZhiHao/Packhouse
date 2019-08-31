const Base = require('./Base')
const Utils = require('./Utils')
const Context = require('./Context')

class LambdaCore extends Base {
    constructor(tool) {
        super('Lambda')
        this.sop = null
        this.tool = tool
        this.welds = []
        this.noGood = null
        this.packages = []
        this.action = this.createLambda('action')
        this.promise = this.createLambda('promise')
    }

    get configs() {
        return {
            sop: this.sop,
            welds: Utils.arrayCopy(this.welds),
            noGood: this.noGood,
            packages: Utils.arrayCopy(this.packages)
        }
    }

    createLambda(mode) {
        return (caller, ...args) => {
            let used = {}
            let context = new Context(caller)
            for (let key in this.tool.used) {
                if (this.tool.used[key] instanceof Lambda) {
                    used[key] = this.tool.used[key]._core.copy(context)
                } else {
                    this.$devError('createLambda', 'Include must be a tool or line.')
                }
            }
            return this.tool[mode]({
                args,
                used,
                context,
                configs: this.configs
            })
        }
    }

    copy(context) {
        let lambda = new Lambda(this.tool)
        let action = lambda.action
        let promise = lambda.promise
        let configs = this.configs
        lambda._core.sop = configs.sop
        lambda._core.welds = configs.welds
        lambda._core.noGood = configs.noGood
        lambda._core.packages = configs.packages
        lambda.action = (...args) => action(context, ...args)
        lambda.promise = (...args) => promise(context, ...args)
        return lambda
    }

    addWeld(tool, pack) {
        this.welds.push({ tool, pack })
    }

    setRule(noGood, sop, options) {
        if (noGood) {
            this.setNoGood(noGood, options)
        }
        if (sop) {
            this.setSop(sop)
        }
    }

    setNoGood(action, options) {
        if (typeof action === 'function') {
            this.noGood = { action }
            if (options) {
                this.noGood.options = Utils.verify(options, {
                    resolve: [false, ['boolean'], false]
                })
            }
        } else {
            this.$devError('setNG', 'NG param not a function.', action)
        }
    }

    setSop(action) {
        if (typeof action === 'function') {
            this.sop = action
        } else {
            this.$devError('setSOP', 'SOP param not a function.', action)
        }
    }

    pack(args) {
        this.packages = this.packages.concat(args)
    }

    rePack(args) {
        this.packages = args
    }
}

/**
 * 在宣告tool前的部屬預宣告行為
 * @hideconstructor
 */

class Lambda {
    constructor(tool) {
        this._core = new LambdaCore(tool)
        this.action = this._core.action
        this.promise = this._core.promise
    }

    /**
     * 錯誤預處裡，宣告後會移除action callback的error參數
     * @param {NgCallback} callback 錯誤時執行的對象
     * @param {object} [options] 額外參數
     * @param {boolean} [options.resolve] 在promise模式時，報錯也回傳resolve
     */

    ng(callback, options) {
        this._core.setNoGood(callback, options)
        return this
    }

    /**
     * 不論錯誤或成功都會宣告註冊的函數
     * @param {SopCallback} action 執行的對象
     */

    sop(action) {
        this._core.setSop(action)
        return this
    }

    /**
     * 這是一起宣告ng和sop的接口
     * @param {NgCallback} ng ng callback
     * @param {SopCallback} sop sop callback
     * @param {object} [options] 額外參數
     * @param {boolean} [options.resolve] 在promise模式時，報錯也回傳resolve
     */

    rule(ng, sop, options) {
        this._core.setRule(ng, sop, options)
        return this
    }

    /**
     * 連接每個tool的接口，可以共用ng，weld為註冊制，能不斷註冊，只能使用同group的tool
     * @param {string} tool tool name
     * @param {WeldCallback} callback 包裝並執行
     */

    weld(tool, callback) {
        this._core.addWeld(tool, callback)
        return this
    }

    /**
     * 參數可以預先加入，可接連加入
     * @param  {...any} args 預先加入的參數
     */

    pack(...args) {
        this._core.pack(args)
        return this
    }

    /**
     * 重新配置預參數
     * @param  {...any} args 預先加入的參數
     */

    rePack(...args) {
        this._core.rePack(args)
        return this
    }
}

module.exports = Lambda
