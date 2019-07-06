const Base = require('./Base')
const Helper = require('./Helper')

class SupportCore extends Base {
    constructor() {
        super('Support')
        this.sop = null
        this.welds = []
        this.noGood = null
        this.package = []
    }

    createExports(lambdas) {
        return new Support(this, lambdas)
    }

    copy() {
        return {
            sop: this.sop,
            welds: Helper.arrayCopy(this.welds),
            noGood: this.noGood,
            package: Helper.arrayCopy(this.package)
        }
    }

    addWeld(tool, pack) {
        this.welds.push({ tool, pack })
    }

    unWeld() {
        this.welds = []
    }

    setRule(noGood, sop, options) {
        if (noGood) {
            this.setNoGood(noGood, options)
        }
        if (sop) {
            this.setSop(sop)
        }
    }

    setNoGood(action, options = {}) {
        if (typeof action === 'function') {
            this.noGood = {
                action: action,
                options: this.$verify(options, {
                    resolve: [false, ['boolean'], false]
                })
            }
        } else {
            this.$systemError('setNG', 'NG param not a function.', action)
        }
    }

    unNoGood() {
        this.noGood = null
    }

    setSop(action) {
        if (typeof action === 'function') {
            this.sop = action
        } else {
            this.$systemError('setSOP', 'SOP param not a function.', action)
        }
    }

    unSop() {
        this.sop = null
    }

    pack(args) {
        this.package = this.package.concat(args)
    }

    rePack(args) {
        this.package = args
    }

    unPack() {
        this.package = []
    }

    clear() {
        this.unNoGood()
        this.unSop()
        this.unWeld()
        this.unPack()
    }
}

/**
 * 在宣告tool前的部屬預宣告行為
 * @hideconstructor
 */

class Support {
    constructor(core, lambdas) {
        this._core = core
        this.action = lambdas.action
        this.promise = lambdas.promise
        this.recursive = lambdas.recursive
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
     * 移除錯誤預處裡狀態
     */

    unNg() {
        this._core.unNoGood()
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
     * 移除Sop預處裡狀態
     */

    unSop() {
        this._core.unSop()
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
     * 移除所有註冊的weld
     */

    unWeld() {
        this._core.unWeld()
        return this
    }

    /**
     * 清除所有的預處理狀態
     */

    clear() {
        this._core.clear()
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

    /**
     * 移除預參數
     */

    unPack() {
        this._core.unPack()
        return this
    }
}

module.exports = SupportCore
