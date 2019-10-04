const Base = require('./Base')
const Tool = require('./Tool')
const Utils = require('./Utils')

class Line extends Base {
    constructor(group, options, name) {
        super('Line')
        this.name = name || 'no_name_line'
        this.group = group
        this.options = Utils.verify(options, {
            input: [true, ['function']],
            output: [true, ['function']],
            layout: [true, ['object']],
            install: [false, ['function'], () => {}],
            request: [false, ['array'], []],
            response: [false, ['string'], null]
        })
        this.layoutKeys = Object.keys(this.options.layout)
        this.checkPrivateKey()
    }

    checkPrivateKey() {
        let layout = this.options.layout
        if (layout.action || layout.promise) {
            this.$devError('init', 'Layout has private key is action, promise.')
        }
    }

    use() {
        return (caller, ...args) => {
            return (new Deploy(this, caller, args)).conveyer
        }
    }
}

class Deploy extends Base {
    constructor(main, caller, args) {
        super('Deploy')
        this.flow = []
        this.main = main
        this.args = args
        this.group = this.main.group
        this.caller = caller
        this.layout = main.options.layout
        this.mainTool = undefined
        this.init()
    }

    init() {
        this.input = this.createTool('input', {
            request: this.main.options.request,
            handler: this.main.options.input,
            install: system => this.main.options.install(system)
        })
        this.output = this.createTool('output', {
            handler: this.main.options.output,
            response: this.main.options.response
        })
        this.initConveyer()
    }

    createTool(name, options) {
        let tool = new Tool(this.main.group, options, `line-${this.main.name}-${name}`, this.mainTool)
        if (this.mainTool == null) {
            this.mainTool = tool
        }
        return tool.use()
    }

    initConveyer() {
        this.conveyer = {
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }
        for (let name of this.main.layoutKeys) {
            this.conveyer[name] = (...args) => {
                this.register(name, args)
                return this.conveyer
            }
        }
    }

    register(name, args) {
        this.flow.push({
            name,
            args,
            tool: this.createTool(name, this.layout[name])
        })
    }

    action(callback) {
        let error = error => callback(error, null)
        let success = result => callback(null, result)
        this.process(success, error)
    }

    promise() {
        return new Promise((resolve, reject) => {
            this.process(resolve, reject)
        })
    }

    process(success, error) {
        new Process(this, success, error)
    }
}

class Process extends Base {
    constructor(deploy, success, error) {
        super('Process')
        this.stop = false
        this.index = 0
        this.deploy = deploy
        this.error = error
        this.success = success
        this.context = null
        this.deploy
            .input
            .noGood(e => this.fail(e))
            .always(data => { this.context = data.context })
            .action(this.deploy.caller, ...this.deploy.args, () => {
                this.next()
            })
    }

    fail(error) {
        if (this.stop === false) {
            this.stop = true
            this.error(error)
        }
    }

    next() {
        if (this.stop === true) {
            return null
        }
        let flow = this.deploy.flow[this.index]
        if (flow) {
            flow.tool
                .noGood(e => this.fail(e))
                .action(this.context, ...flow.args, () => {
                    this.index += 1
                    this.next()
                })
        } else {
            this.finish()
        }
    }

    finish() {
        this.deploy
            .output
            .noGood(e => this.fail(e))
            .action(this.context, this.success)
    }
}

module.exports = Line
