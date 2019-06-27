const Helper = require('./Helper')

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
        return {
            alias: this.group.options.alias,
            message: message || 'unknown error'
        }
    }

    error(result) {
        if (this.over === false) {
            this.over = true
            this.errorBase(result)
            this.callSop({ result, success: false })
        }
    }

    success(result, context) {
        if (this.over === false) {
            this.over = true
            this.runWeld(result, (result) => {
                this.successBase(result, context)
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
            weld.packing(result, tool.packing)
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
    successBase(result, context) {
        if (this.noGood) {
            this.callback(result, context)
        } else {
            this.callback(null, result, context)
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
