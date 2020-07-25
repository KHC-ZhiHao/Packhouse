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
     * @desc 當lambda被執行後要拷貝狀態，並清空歷史資料
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
