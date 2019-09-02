const Base = require('./Base.js')
const Utils = require('./Utils.js')

class Response extends Base {
    constructor(caller, context, configs) {
        super('Response')
        this.over = false
        this.welds = null
        this.group = caller.group
        this.caller = caller
        this.context = context
        this.exports = {
            error: this.error.bind(this),
            success: this.success.bind(this)
        }
        if (configs) {
            this.always = configs.always
            if (configs.welds.length > 0) {
                this.welds = Utils.arrayCopy(configs.welds)
            }
            if (configs.noGood) {
                this.noGood = configs.noGood
                this.noGoodOptions = configs.noGoodOptions
            }
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
            this.caller.emit('done', {
                ...this.context,
                detail: {
                    result,
                    success: false
                }
            })
            this.callAlways({
                result,
                success: false
            })
            this.errorBase(result)
        }
    }

    success(result) {
        if (this.over === false) {
            this.over = true
            this.caller.emit('done', {
                ...this.context,
                detail: {
                    result,
                    success: true
                }
            })
            this.runWeld(result, (result) => {
                this.callAlways({
                    result,
                    success: true
                })
                this.successBase(result)
            })
        }
    }

    runWeld(result, callback) {
        if (this.welds == null) {
            callback(result)
            return null
        }
        let tool = null
        let weld = this.welds.shift()
        let noGood = (result) => {
            if (this.noGood) {
                this.noGood(result)
            }
            this.callAlways({
                result,
                success: false
            })
            this.errorBase(result)
        }
        if (weld) {
            tool = this.group.callTool(weld.tool)
            weld.pack(result, tool.pack.bind(tool))
            tool.action(this.context, (error, result) => {
                if (error) {
                    noGood(error)
                } else {
                    this.runWeld(result, callback)
                }
            })
        } else {
            callback(result)
        }
    }

    callAlways(context) {
        if (this.always) {
            this.always(context)
        }
    }
}

class Action extends Response {
    constructor(caller, configs, context, callback) {
        super(caller, context, configs)
        this.callback = callback
        if (typeof callback !== 'function') {
            this.$devError('getActionCallback', 'Action must has a callback.')
        }
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

class Promise extends Response {
    constructor(caller, configs, context, resolve, reject) {
        super(caller, context, configs)
        this.reject = reject
        this.resolve = resolve
    }

    errorBase(result) {
        let message = this.getError(result)
        if (this.noGood) {
            this.noGood(message)
        }
        if (this.noGood && !this.noGoodOptions.reject) {
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
    Promise
}
