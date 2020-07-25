const Base = require('./Base')
const Utils = require('./Utils')
const Context = require('./Context')

function arrayCopy(array) {
    var i = array.length
    var output = []
    while (i--) {
        output[i] = array[i]
    }
    return output
}

class LambdaCore extends Base {
    constructor(tool) {
        super('Lambda')
        this.tool = tool
        this.always = null
        this.noGood = null
        this.noGoodOptions = {}
        this.packages = []
        this.action = this.createLambda('action')
        this.promise = this.createLambda('promise')
    }

    get configs() {
        return {
            always: this.always,
            noGood: this.noGood,
            noGoodOptions: Object.assign({}, this.noGoodOptions),
            packages: arrayCopy(this.packages)
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
                    let packs = this.tool.packs[key]
                    used[key] = (...args) => this.tool.used[key](context, ...packs, ...args)
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
        lambda._core.always = configs.always
        lambda._core.noGood = configs.noGood
        lambda._core.packages = configs.packages
        lambda.action = (...args) => action(context, ...args)
        lambda.promise = (...args) => promise(context, ...args)
        return lambda
    }

    setNoGood(action, options) {
        if (typeof action === 'function') {
            this.noGood = action
            this.noGoodOptions = Utils.verify(options || {}, {
                reject: [false, ['boolean'], false]
            })
        } else {
            this.$devError('setNoGood', 'Nogood param not a function.', action)
        }
    }

    setAlways(action) {
        if (typeof action === 'function') {
            this.always = action
        } else {
            this.$devError('setAlways', 'Always param not a function.', action)
        }
    }

    pack(args) {
        this.packages = this.packages.concat(args)
    }
}

class Lambda {
    constructor(tool) {
        this._core = new LambdaCore(tool)
        this.action = this._core.action
        this.promise = this._core.promise
    }

    pack(...args) {
        this._core.pack(args)
        return this
    }

    noGood(callback, options) {
        this._core.setNoGood(callback, options)
        return this
    }

    always(action) {
        this._core.setAlways(action)
        return this
    }
}

module.exports = Lambda
