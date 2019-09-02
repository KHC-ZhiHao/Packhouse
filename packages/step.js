const Packhouse = require('packhouse')

class StepCore {
    constructor(options) {
        this.timeout = null
        this.options = Packhouse.utils.verify(options, {
            middle: [true, ['function']],
            output: [true, ['function']],
            timeout: [false, ['number'], null]
        })
    }

    register(packhouse) {
        this.packhouse = packhouse
    }

    start(templates) {
        return new Promise((resolve) => {
            new Flow(this, templates, resolve)
        })
    }
}

class History {
    constructor(core) {
        this.list = []
        this.index = 0
        this.packhouse = core.packhouse
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

    input({ name }) {
        let logs = {}
        let data = {
            name,
            logs: {},
            startTime: Date.now(),
            finishTime: null
        }
        this.list[this.index] = data
        this.useEventId = this.packhouse.on('use', (event, { id, caller, detail }) => {
            logs[id] = {
                logs: {},
                startTime: Date.now(),
                ...detail
            }
            if (caller) {
                logs[caller.id].logs[id] = logs[id]
            }
        })
        this.doneEventId = this.packhouse.on('done', (event, { id, caller, detail }) => {
            logs[id].result = detail.result
            logs[id].success = detail.success
            logs[id].finishTime = Date.now()
            logs[id].totalTime = logs[id].finishTime - logs[id].startTime
        })
    }

    output() {
        this.list[this.index].finishTime = Date.now()
        this.index += 1
        this.packhouse.off(this.useEventId)
        this.packhouse.off(this.doneEventId)
    }
}

class Flow extends Base {
    constructor(core, templates, callback) {
        super('Flow')
        this.core = core
        this.self = {}
        this.over = false
        this.history = new History(core)
        this.callback = callback
        this.templates = templates.slice()
        this.initContext()
        this.initTimeout()
    }

    initContext() {
        this.context = {
            exit: (message) => { this.finish(true, message) },
            fail: (message) => { this.finish(false, message) },
            lastCall: null,
            nextCall: null
        }
    }

    initTimeout() {
        if (this.core.timeout == null) {
            return null
        }
        this.timeout = setTimeout(() => this.timeoutHandler(), this.core.timeout)
    }

    timeoutHandler() {
        if (this.over === false) {
            let history = this.history.exports()
            this.core.output.call(this.self, (result) => {
                this.done()
                this.callback(result)
            }, {
                history,
                timeout: true
            })
        }
    }

    start() {
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
                next = () => this.$systemError('iterator', 'Next has already been declared.')
                this.history.output()
                this.next()
            }
            this.history.input({ name: template.name })
            this.context.lastCall = template.name || null
            this.context.nextCall = this.templates[0] ? this.templates[0].name : null
            template.call(this.self, next, this.context)
        }
    }

    next() {
        setTimeout(() => {
            if (this.over === false) {
                this.core.options.middle.call(this.self, this.context)
                this.iterator()
            }
        }, 1)
    }

    done() {
        this.over = true
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
    }

    finish(success, message) {
        let history = this.history.exports()
        if (this.over === false) {
            this.over = true
            this.core.options.output.call(this.self, (result) => {
                this.done()
                this.callback(result)
            }, {
                success,
                message,
                history,
                timeout: false
            })
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

    install(packhouse) {
        this._core.register(packhouse)
        packhouse.step = templates => this._core.start(templates)
    }
}

module.exports = Step
