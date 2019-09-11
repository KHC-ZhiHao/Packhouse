const Base = require('./Base')
const Tool = require('./Tool')
const Utils = require('./Utils')
const Context = require('./Context')
const Response = require('./Response')

class Line extends Base {
    constructor(group, options, name) {
        super('Line')
        this.name = name || 'no_name_line'
        this.group = group
        this.options = Utils.verify(options, {
            input: [true, ['function']],
            frame: [false, ['function'], () => {}],
            molds: [false, ['array'], []],
            output: [true, ['function']],
            layout: [true, ['object']]
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
        return (...args) => {
            return (new Deploy(this, args)).conveyer
        }
    }
}

class Deploy extends Base {
    constructor(main, args) {
        super('Deploy')
        this.flow = []
        this.main = main
        this.args = args
        this.group = this.main.group
        this.layout = main.options.layout
        this.context = new Context()
        this.mainTool = undefined
        this.init()
    }

    init() {
        this.input = this.createTool('input', {
            molds: this.main.options.molds,
            handler: this.main.options.input,
            install: system => this.main.options.frame(system)
        })
        this.output = this.createTool('output', {
            handler: this.main.options.output
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

    emit(channel, data) {
        this.group.packhouse.event.emit(channel, data)
    }

    action(callback) {
        let response = new Response.Action(this, null, this.context, callback)
        this.process('action', response)
    }

    promise() {
        return new Promise((resolve, reject) => {
            let response = new Response.Promise(this, null, this.context, resolve, reject)
            this.process('promise', response)
        })
    }

    process(mode, response) {
        this.emit('run', {
            ...context,
            detail: {
                type: 'line',
                name: this.main.name,
                args: this.args,
                mode
            }
        })
        new Process(this, response)
    }
}

class Process extends Base {
    constructor(deploy, response) {
        super('Process')
        this.stop = false
        this.index = 0
        this.deploy = deploy
        this.error = response.exports.error
        this.success = response.exports.success
        this.deploy
            .input
            .noGood(e => this.fail(e))
            .action(this.deploy.context, ...this.deploy.args, this.next.bind(this))
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
                .action(this.deploy.context, ...flow.args, () => {
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
            .action(this.deploy.context, this.success)
    }
}

module.exports = Line
