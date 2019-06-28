const Base = require('./Base')
const Tool = require('./Tool')
const Support = require('./Support')
const Response = require('./Response')

class Line extends Base {
    constructor(group, options) {
        super('Line')
        this.tools = {}
        this.group = group
        this.options = this.$verify(options, {
            molds: [false, ['array'], []],
            inlet: [false, ['object'], null],
            input: [true, ['function']],
            output: [true, ['function']],
            layout: [true, ['object']]
        })
        this.layoutKeys = Object.keys(this.options.layout)
        this.checkPrivateKey()
    }

    checkPrivateKey() {
        let layout = this.options.layout
        if (layout.action || layout.promise || layout.setRule) {
            this.$systemError('init', 'Layout has private key is action, promise, setRule')
        }
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
        this.input = this.createTool({
            molds: this.main.options.molds,
            action: this.main.options.input
        })
        this.output = this.createTool(this.main.options.output)
        this.initConveyer()
    }

    createTool(target) {
        let opts = typeof target === 'function' ? { action: target } : target
        let tool = new Tool(this.main.group, opts, this.store)
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
        let inlet = this.main.options.inlet
        if (inlet && inlet.length !== 0 && this.flow.length === 0 && !inlet.includes(name)) {
            this.$systemError('register', `First call method not inside inlet, you use '${name}'.`)
        }
        this.flow.push({
            name: name,
            method: this.createTool(this.layout[name]),
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
            this.error(error.message)
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
