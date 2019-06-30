let Base = require('./Base')

class StepCore extends Base {
    constructor(options) {
        super('Step')
        this.templates = []
        this.options = this.$verify(options, {
            addon: [false, ['function'], (t) => t],
            input: [true, ['function']],
            middle: [true, ['function']],
            output: [true, ['function']],
            timeout: [false, ['number'], -1]
        })
    }

    addTemplate(func) {
        if (typeof func !== 'function') {
            this.$systemError('addTemplate', 'Param not a function.')
        }
        this.templates.push(func)
    }

    start(type, args, params) {
        return new Promise((resolve, reject) => {
            new Flow(this, args, params, (success, data) => {
                if (type === 'run') {
                    success ? resolve(data) : reject(data)
                }
                if (type === 'generator') {
                    resolve(data)
                }
            })
        })
    }
}

class Case {}
class Flow {
    constructor(step, args, { options, templates }, callback) {
        this.step = step
        this.case = new Case()
        this.over = false
        this.callback = callback
        this.templates = step.options.addon(templates)
        this.initContext()
        this.initTimeout()
        this.start(args, options)
    }

    initContext() {
        this.flow = {
            exit: this.exit.bind(this),
            fail: this.fail.bind(this)
        }
        this.context = {
            ...this.flow,
            lastCall: ''
        }
    }

    initTimeout() {
        if (this.step.options.timeout === -1) {
            return null
        }
        this.timeout = setTimeout(() => {
            this.fail('timeout')
        }, this.step.options.timeout * 1000)
    }

    start(args, options) {
        this.step.options.input.call(this.case, args, options, this.flow)
        this.iterator()
    }

    iterator() {
        if (this.over === false) {
            let template = this.templates.shift()
            if (template == null) {
                return this.flow.exit()
            }
            let next = () => {
                next = () => { this.fail('Next has already been declared') }
                this.next()
            }
            this.context.lastCall = template.name || 'no name'
            template.call(this.case, next, this.flow)
        }
    }

    next() {
        if (this.over === false) {
            this.step.options.middle.call(this.case, this.context)
            this.iterator()
        }
    }

    exit(message) {
        this.finish(true, message)
    }

    fail(message) {
        this.finish(false, message)
    }

    finish(success, message) {
        if (this.over === false) {
            if (this.timeout) { clearTimeout(this.timeout) }
            let data = this.step.options.output.call(this.case, { success, message })
            this.over = true
            this.callback(success, this.getResponse(data))
        }
    }

    getResponse(data) {
        return {
            data
        }
    }
}

class Step {
    constructor(options) {
        this._core = new StepCore(options)
    }

    run(params = {}) {
        let args = params.args
        params = this.$verify(params, {
            options: [false, ['object'], {}],
            templates: [true, ['array']]
        })
        return this._core.start('run', args, params)
    }

    generator(params) {
        params = this.$verify(params, {
            options: [false, ['object'], {}],
            templates: [true, ['array']]
        })
        return async(...args) => {
            let result = await this._core.start('generator', args, params)
            return result.data
        }
    }
}

module.exports = Step
