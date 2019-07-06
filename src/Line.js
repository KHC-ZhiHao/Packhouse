const Base = require('./Base')
const Tool = require('./Tool')
const Support = require('./Support')
const Response = require('./Response')

class Line extends Base {
    constructor(group, options, context = {}) {
        super('Line')
        this.name = context.name || 'no_name_line'
        this.tools = {}
        this.group = group
        this.options = this.$verify(options, {
            molds: [false, ['array'], []],
            input: [true, ['function']],
            output: [true, ['function']],
            layout: [true, ['object']]
        })
        this.layoutKeys = Object.keys(this.options.layout)
        this.checkPrivateKey()
    }

    checkPrivateKey() {
        let layout = this.options.layout
        if (layout.action || layout.promise || layout.rule) {
            this.$systemError('init', 'Layout has private key is action, promise, rule')
        }
    }

    emit(name, options) {
        this.group.emit(name, {
            type: 'line',
            from: this.name,
            ...options
        })
    }

    use() {
        return (...args) => {
            return (new Deploy(this, args)).conveyer
        }
    }
}

class Deploy extends Base {
    constructor(main, params) {
        super('Deploy')
        this.flow = []
        this.main = main
        this.params = params
        this.layout = main.options.layout
        this.supports = new Support()
        this.init()
    }

    init() {
        this.input = this.createTool('input', {
            molds: this.main.options.molds,
            action: this.main.options.input
        })
        this.output = this.createTool('output', this.main.options.output)
        this.initConveyer()
    }

    createTool(name, target) {
        let opts = typeof target === 'function' ? { action: target } : target
        let tool = new Tool(this.main.group, opts, {
            name: 'line-' + this.main.name + '-' + name,
            store: this.store
        })
        if (this.store == null) {
            this.store = tool.store
        }
        return tool.use()
    }

    initConveyer() {
        this.conveyer = {
            action: this.action.bind(this),
            promise: this.promise.bind(this),
            setRule: this.setRule.bind(this)
        }
        for (let name of this.main.layoutKeys) {
            this.conveyer[name] = (...options) => {
                this.register(name, options)
                return this.conveyer
            }
        }
    }

    register(name, params) {
        this.flow.push({
            name: name,
            method: this.createTool(name, this.layout[name]),
            params: params
        })
    }

    action(callback) {
        let supports = this.supports.copy()
        let response = new Response.Action(this.main.group, supports, callback)
        this.process(response)
    }

    promise() {
        return new Promise((resolve, reject) => {
            let supports = this.supports.copy()
            let response = new Response.Promise(this.main.group, supports, resolve, reject)
            this.process(response)
        })
    }

    setRule(...options) {
        this.supports.setRule(...options)
        return this.conveyer
    }

    process(response) {
        this.main.emit('action-line-before')
        new Process(this, response)
    }
}

class Process extends Base {
    constructor(deploy, response) {
        super('Process')
        this.stop = false
        this.flow = deploy.flow
        this.index = 0
        this.input = deploy.input
        this.params = deploy.params
        this.output = deploy.output
        this.error = response.exports.error
        this.success = response.exports.success
        this.input
            .ng(e => this.fail(e))
            .action(...this.params, this.next.bind(this))
    }

    finish() {
        this.output
            .ng(e => this.fail(e))
            .action(this.success)
    }

    fail(error) {
        if (this.stop === false) {
            this.stop = true
            this.error(error)
        }
    }

    next() {
        if (this.stop === true) return
        let flow = this.flow[this.index]
        if (flow) {
            flow.method
                .ng(e => this.fail(e))
                .action(...flow.params, () => {
                    this.index += 1
                    this.next()
                })
        } else {
            this.finish()
        }
    }
}

module.exports = Line
