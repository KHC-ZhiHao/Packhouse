const Base = require('./Base')

class StepCore extends Base {
    constructor(options) {
        super('Step')
        this.options = this.$verify(options, {
            router: [true, ['function']],
            channels: [true, ['object']]
        })
        this.initChannel()
    }

    initChannel() {
        this.channels = {}
        for (let key in this.options.channels) {
            this.channels[key] = new Channel(this.options.channels[key])
        }
    }

    getChannel(options) {
        let name = this.options.router(options)
        let channel = this.channels[name]
        if (channel == null) {
            this.$systemError('getChannel', `Channel(${name}) not found.`)
        }
        return channel
    }
}

class Channel extends Base {
    constructor(options) {
        super('Step')
        this.options = this.$verify(options, {
            base: [false, ['object'], {}],
            hook: [false, ['function'], (t) => t],
            input: [true, ['function']],
            middle: [true, ['function']],
            output: [true, ['function']],
            timeout: [false, ['number'], -1]
        })
        this.initBase()
    }

    initBase() {
        let base = this.options.base
        this.Base = function(core) {
            this._core = core
            this._base = base
        }
        for (let key in this.options.base) {
            this.Base.prototype[key] = function() {
                this._base[key].apply(this._core, arguments)
            }
        }
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

class History {
    constructor() {
        this.list = []
        this.index = 0
    }

    exports() {
        return {
            templates: this.list
        }
    }

    punchOn({ name }) {
        this.list[this.index] = {
            name,
            startTime: Date.now(),
            finishTime: null
        }
    }

    punchOut() {
        this.list[this.index].finishTime = Date.now()
        this.index += 1
    }
}

class Flow extends Base {
    constructor(channel, args, { options, templates }, callback) {
        super('Flow')
        this.channel = channel
        this.case = new Case()
        this.base = new channel.Base(this.case)
        this.over = false
        this.history = new History()
        this.callback = callback
        this.templates = channel.options.hook.call(this.case, templates.slice(), options)
        this.initContext()
        this.initTimeout()
        this.start(args, options)
    }

    initContext() {
        this.context = {
            base: this.base,
            exit: this.exit.bind(this),
            fail: this.fail.bind(this),
            lastCall: null,
            nextCall: null
        }
    }

    initTimeout() {
        if (this.channel.options.timeout === -1) {
            return null
        }
        this.timeout = setTimeout(() => {
            this.fail('timeout')
        }, this.channel.options.timeout)
    }

    start(args, options) {
        this.channel.options.input.call(this.case, args, options, this.context)
        this.iterator()
    }

    iterator() {
        if (this.over === false) {
            let template = this.templates.shift()
            if (template == null) {
                return this.context.exit()
            }
            let next = () => {
                if (this.over) {
                    return this.$systemError('iterator', 'Step is exit or fail.')
                }
                next = () => { this.$systemError('iterator', 'Next has already been declared.') }
                this.history.punchOut()
                this.next()
            }
            this.history.punchOn({ name: template.name })
            this.context.nextCall = this.templates[0] ? this.templates[0].name : null
            this.context.lastCall = template.name || null
            template.call(this.case, next, this.context)
        }
    }

    next() {
        if (this.over === false) {
            this.channel.options.middle.call(this.case, this.context)
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
            let history = this.history.exports()
            let data = this.channel.options.output.call(this.case, {
                success,
                message,
                history
            })
            this.over = true
            this.callback(success, this.getResponse(data, history))
        }
    }

    getResponse(data, history) {
        return {
            data,
            history
        }
    }
}

/**
 * Step function can contorl flow
 * @hideconstructor
 */

class Step {
    constructor(options) {
        this._core = new StepCore(options)
    }

    /**
     * 擲出generator並綁定step
     * @returns {function} generator function
     */

    export() {
        return this.generator.bind(this)
    }

    /**
     * 直接運行step
     * @param {object} options 運行參數
     * @param {array} options.args 參數列
     * @param {object} options.options step options
     * @param {array} options.template 運行的functions
     * @returns {Promise}
     */

    run(options = {}, type = 'run') {
        let args = options.args
        let params = this._core.$verify(options, {
            options: [false, ['object'], {}],
            templates: [true, ['array']]
        })
        return this._core.getChannel(params.options).start(type, args, params)
    }

    /**
     * 建立並返回新的async function
     * @param {object} options 建立的參數
     * @param {object} options.options step options
     * @param {array} options.templates 運行的functions
     * @returns {function} async function
     */

    generator(options) {
        return async(...args) => {
            let result = await this.run({ args, ...options }, 'generator')
            return result.data
        }
    }
}

module.exports = Step
