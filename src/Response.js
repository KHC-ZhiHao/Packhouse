const Base = require('./Base.js')
const Utils = require('./Utils.js')

class Response extends Base {
    constructor(tool, context, configs) {
        super('Response')
        this.over = false
        this.tool = tool
        this.welds = null
        this.group = tool.group
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
            this.tool.emit('done', {
                ...this.context,
                detail: {
                    result,
                    success: false
                }
            })
            this.errorBase(result)
            this.callAlways({
                result,
                context: this.context,
                success: false
            })
        }
    }

    success(result) {
        if (this.over === false) {
            let response = this.tool.options.response
            if (response) {
                try {
                    result = this.group.parseMold(response, result, 0, 'Response::')
                } catch (error) {
                    return this.error(error)
                }
            }
            this.over = true
            this.tool.emit('done', {
                ...this.context,
                detail: {
                    result,
                    success: true
                }
            })
            this.runWeld(result, (result) => {
                this.successBase(result)
                this.callAlways({
                    result,
                    context: this.context,
                    success: true
                })
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
        if (weld) {
            tool = this.group.callTool(weld.tool)
            weld.pack(result, tool.pack.bind(tool))
            tool.action(this.context, (error, result) => {
                if (error) {
                    this.errorBase(error)
                    this.callAlways({
                        result: error,
                        context: this.context,
                        success: false
                    })
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
    constructor(tool, configs, context, callback) {
        super(tool, context, configs)
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
    constructor(tool, configs, context, resolve, reject) {
        super(tool, context, configs)
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
