class StepCore {
    constructor(packhouse, options) {
        this.timeout = null
        this.packhouse = packhouse
        this.options = packhouse.utils.verify(options, {
            create: [false, ['function'], () => {}],
            middle: [false, ['function'], () => {}],
            output: [true, ['function']],
            timeout: [false, ['number'], null],
            failReject: [false, ['boolean', false]]
        })
    }

    start(options, templates) {
        return new Promise((resolve, reject) => {
            new Flow(this, options, templates, resolve, reject)
        })
    }
}

class History {
    constructor(core) {
        this.list = []
        this.index = 0
        this.startTime = Date.now()
        this.packhouse = core.packhouse
    }

    inspect(target, used = []) {
        if (target == null) {
            return null
        }
        let output = Array.isArray(target) ? [] : {}
        for (let key in target) {
            let aims = target[key]
            let type = this.packhouse.utils.getType(aims)
            if (type === 'function') {
                continue
            } else if (type === 'object' || type === 'array') {
                let newUsed = [target].concat(used)
                if (newUsed.includes(aims)) {
                    output[key] = {
                        inspect: true,
                        type: 'CircularStructureObject'
                    }
                } else {
                    output[key] = this.inspect(aims, newUsed)
                }
            } else {
                if (type === 'buffer') {
                    output[key] = {
                        inspect: true,
                        type: 'buffer',
                        size: aims.length
                    }
                } else if (type === 'promise') {
                    output[key] = {
                        inspect: true,
                        type: 'promise'
                    }
                } else if (type === 'NaN') {
                    output[key] = {
                        inspect: true,
                        type: 'NaN'
                    }
                } else if (type === 'regexp') {
                    output[key] = {
                        inspect: true,
                        type: 'regexp',
                        expression: aims.toString()
                    }
                } else {
                    output[key] = aims
                }
            }
        }
        return output
    }

    exports() {
        let now = Date.now()
        let profile = {
            startTime: this.startTime,
            finishTime: now,
            totalTime: now - this.startTime
        }
        return {
            profile,
            templates: this.list,
            isDone: name => this.isDone(name),
            toJSON: (beautify) => {
                let data = {
                    profile,
                    templates: this.list
                }
                if (beautify) {
                    return JSON.stringify(this.inspect(data), null, 4)
                }
                return JSON.stringify(this.inspect(data))
            }
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
        this.useEventId = this.packhouse.on('run', (event, { id, caller, detail }) => {
            logs[id] = {
                logs: {},
                startTime: Date.now(),
                ...detail
            }
            if (caller) {
                logs[caller.id].logs[id] = logs[id]
            } else {
                data.logs[id] = logs[id]
            }
        })
        this.doneEventId = this.packhouse.on('done', (event, { id, caller, detail }) => {
            let log = null
            if (caller) {
                log = logs[caller.id].logs[id]
            } else {
                log = data.logs[id]
            }
            log.result = detail.result
            log.success = detail.success
            log.finishTime = Date.now()
            log.totalTime = logs[id].finishTime - logs[id].startTime
        })
    }

    output() {
        this.list[this.index].finishTime = Date.now()
        this.list[this.index].totalTime = this.list[this.index].finishTime - this.list[this.index].startTime
        this.index += 1
        this.packhouse.off('run', this.useEventId)
        this.packhouse.off('done', this.doneEventId)
    }
}

class Flow {
    constructor(core, options, templates, success, error) {
        this.core = core
        this.self = {}
        this.over = false
        this.error = error
        this.options = options
        this.success = success
        this.history = new History(core)
        this.templates = templates.slice()
        this.initContext()
        this.initTimeout()
        this.start()
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
            let context = {
                history,
                timeout: true
            }
            this.core.options.output.call(this.self, context, (result) => {
                this.done()
                this.success(result)
            }, (result) => {
                this.done()
                this.error(result)
            })
        }
    }

    start() {
        let templates = this.core.options.create.call(this.self, this.templates, this.options)
        if (templates) {
            this.templates = templates
        }
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
                    throw new Error('Packhouse Step : Already exit or fail.')
                }
                next = () => {
                    throw new Error('Packhouse Step : Already exit or fail.')
                }
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
        let context = {
            success,
            message,
            history,
            timeout: false
        }
        if (this.over === false) {
            this.over = true
            this.core.options.output.call(this.self, context, (result) => {
                this.done()
                this.success(result)
            }, (result) => {
                this.done()
                this.error(result)
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
        this._options = options
    }

    install(packhouse) {
        this._core = new StepCore(packhouse, this._options)
        packhouse.step = ({ templates, options }) => {
            return this._core.start(options, templates)
        }
    }
}

module.exports = Step
