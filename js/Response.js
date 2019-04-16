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