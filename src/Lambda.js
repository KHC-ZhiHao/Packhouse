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
                used,
                args,
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

    repack(args) {
        this.packages = args
    }
}

class Lambda {
    constructor(tool) {
        this._core = new LambdaCore(tool)
        this.action = this._core.action
        this.promise = this._core.promise
    }

    noGood(callback, options) {
        this._core.setNoGood(callback, options)
        return this
    }

    sop(action) {
        this._core.setSop(action)
        return this
    }

    weld(tool, callback) {
        this._core.addWeld(tool, callback)
        return this
    }

    pack(...args) {
        this._core.pack(args)
        return this
    }

    repack(...args) {
        this._core.repack(args)
        return this
    }
}

module.exports = Lambda
