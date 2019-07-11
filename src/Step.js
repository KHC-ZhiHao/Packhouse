const Base = require('./Base')

class StepCore extends Base {
    constructor(options) {
        super('Step')
        this.timeout = null
        this.templates = []
        this.options = this.$verify(options, {
            mixin: [false, ['function'], (t) => t],
            input: [true, ['function']],
            middle: [true, ['function']],
            output: [true, ['function']]
        })
        if (options.timeout) {
            this.timeout = this.$verify(options.timeout, {
                ms: [true, ['number']],
                output: [true, ['function']]
            })
        }
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

/**
 * Step的歷史紀錄
 * @hideconstructor
 * @property {array} templates 每個template的歷程
 * @property {function} isDone 給step function key時如果執行完畢會回傳true
 */

class History {
    constructor() {
        this.list = []
        this.index = 0
    }

    exports() {
        return {
            templates: this.list,
            isDone: name => this.isDone(name)
        }
    }

    isDone(name) {
        let target = this.list.find(temp => temp.name === name) || {}
        return !!target.finishTime
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

class Case {}

class Flow extends Base {
    constructor(step, args, { options, templates, beforeOutput }, callback) {
        super('Flow')
        this.step = step
        this.case = new Case()
        this.over = false
        this.history = new History()
        this.callback = callback
        this.templates = step.options.mixin.call(this.case, templates.slice(), options)
        this.beforeOutput = beforeOutput
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
            lastCall: null,
            nextCall: null
        }
    }

    initTimeout() {
        if (this.step.timeout == null) {
            return null
        }
        this.timeout = setTimeout(() => { this.timeoutHandler() }, this.step.timeout.ms)
    }

    timeoutHandler() {
        if (this.over === false) {
            let history = this.history.exports()
            let context = { success: false, message: 'timeout', history }
            let data = this.step.timeout.output.call(this.case, context)
            this.done()
            this.callback(false, this.getResponse(data, history))
        }
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
            template.call(this.case, next, this.flow)
        }
    }

    next() {
        if (this.over === false) {
            try {
                this.step.options.middle.call(this.case, this.context)
            } catch (error) {
                this.done()
                throw error
            }
            this.iterator()
        }
    }

    exit(message) {
        this.finish(true, message)
    }

    fail(message) {
        this.finish(false, message)
    }

    done() {
        this.over = true
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
    }

    finish(success, message) {
        let history = this.history.exports()
        let context = { success, message, history }
        if (this.over === false) {
            this.over = true
            this.beforeOutput.call(this.case, () => {
                let data = this.step.options.output.call(this.case, context)
                this.done()
                this.callback(success, this.getResponse(data, history))
            }, context)
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
     * @param {asyncFunction} [options.beforeOutput] 運行output前的攔截
     * @returns {Promise}
     */

    run(options = {}) {
        let args = options.args
        let params = this._core.$verify(options, {
            options: [false, ['object'], {}],
            templates: [true, ['array']],
            beforeOutput: [false, ['function'], done => { done() }]
        })
        return this._core.start('run', args, params)
    }

    /**
     * 建立並返回新的async function
     * @param {object} options 建立的參數
     * @param {object} options.options step options
     * @param {array} options.templates 運行的functions
     * @param {asyncFunction} [options.beforeOutput] 運行output前的攔截
     * @returns {function} async function
     */

    generator(options) {
        let params = this._core.$verify(options, {
            debug: [false, ['boolean'], false],
            options: [false, ['object'], {}],
            templates: [true, ['array']],
            beforeOutput: [false, ['function'], done => { done() }]
        })
        return async(...args) => {
            let result = await this._core.start('generator', args, params)
            return result.data
        }
    }
}

module.exports = Step
