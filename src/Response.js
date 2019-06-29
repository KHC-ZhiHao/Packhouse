const Helper = require('./Helper')

/**
 * @namespace Response
 * @description 執行tool或line時最後呼叫的模式
 */

/**
 * @function Response.Action
 * @description 使用callback來接收參數
 * @param {...any} params 該tool需要的參數
 * @param {function} callback (error, result)
 */

/**
 * @function Response.Promise
 * @description 使用promise接收參數
 * @param {...any} params 該tool需要的參數
 * @returns {promise}
 */

/**
 * @function Response.Recursive
 * @description 遞迴這個tool，不支援line
 * @param {...any} params 該tool需要的參數
 * @param {function} callback (error, result, { count, stack })
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
            this.welds = Helper.arrayCopy(supports.welds)
        }
        if (supports.noGood) {
            this.noGood = supports.noGood.action
            this.noGoodOptions = supports.noGood.options
        }
    }

    isLive() {
        return !this.over
    }

    getError(message) {
        return message || 'unknown error'
    }

    error(result) {
        if (this.over === false) {
            this.over = true
            this.errorBase(result)
            this.callSop({ result, success: false })
        }
    }

    success(result) {
        if (this.over === false) {
            this.over = true
            this.runWeld(result, (result) => {
                this.successBase(result)
                this.callSop({ result, success: true })
            })
        }
    }

    runWeld(result, callback) {
        if (this.welds == null) {
            callback(result)
            return null
        }
        let weld = this.welds.shift()
        let tool = null
        let noGood = (e) => {
            this.noGood(e)
            this.callSop({ result, success: false })
        }
        if (weld) {
            tool = this.group.callTool(weld.tool)
            weld.pack(result, tool.pack.bind(tool))
            tool.ng(noGood, this.noGoodOptions)
                .action((result) => {
                    this.runWeld(result, callback)
                })
        } else {
            callback(result)
        }
    }

    callSop(context) {
        if (this.sop) {
            this.sop(context)
        }
    }
}

class Action extends Response {
    constructor(group, supports, callback) {
        super(group, supports)
        this.callback = callback || function() {}
    }

    errorBase(result) {
        let message = this.getError(result)
        if (this.noGood) {
            this.noGood(message)
        } else {
            this.callback(message, null)
        }
    }

    successBase(result) {
        if (this.noGood) {
            this.callback(result)
        } else {
            this.callback(null, result)
        }
    }
}

class Recursive extends Action {
    constructor(tool, group, supports, callback, count) {
        super(group, supports, callback)
        this.context = {
            count: count + 1,
            stack: (...params) => {
                params = Helper.createArgs(params, supports)
                tool.recursive(params, callback, supports, this.context.count)
            }
        }
    }

    successBase(result) {
        if (this.noGood) {
            this.callback(result, this.context)
        } else {
            this.callback(null, result, this.context)
        }
    }
}

class Promise extends Response {
    constructor(group, supports, resolve, reject) {
        super(group, supports)
        this.reject = reject
        this.resolve = resolve
    }

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

    successBase(result) {
        this.resolve(result)
    }
}

module.exports = {
    Action,
    Promise,
    Recursive
}
