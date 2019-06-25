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
