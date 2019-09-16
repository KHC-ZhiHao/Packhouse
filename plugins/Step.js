class StepCore {
    constructor(packhouse) {
        this.packhouse = packhouse
    }

    start(options) {
        let system = this.packhouse.utils.verify(options, {
            create: [false, ['function'], () => {}],
            middle: [false, ['function'], () => {}],
            output: [true, ['function']],
            timeout: [false, ['number'], null],
            template: [true, ['array']],
            failReject: [false, ['boolean', false]]
        })
        return new Promise((resolve, reject) => {
            new Flow(this, system, resolve, reject)
        })
    }
}

class History {
    constructor(flow, core) {
        this.list = []
        this.flow = flow
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
            if (type === 'object' || type === 'array') {
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
                if (type === 'function') {
                    output[key] = {
                        inspect: true,
                        type: 'function',
                        name: aims.name,
                        length: aims.length
                    }
                } else if (type === 'buffer') {
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
                } else if (type === 'error') {
                    output[key] = {
                        inspect: true,
                        type: 'error',
                        trace: aims.trace,
                        message: aims.message
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
            template: this.list,
            isDone: name => this.isDone(name),
            toJSON: (beautify, metadata) => this.toJSON(profile, beautify, metadata)
        }
    }

    toJSON(profile, beautify, metadata = {}) {
        let data = {
            profile,
            metadata,
            template: this.list
        }
        if (beautify) {
            return JSON.stringify(this.inspect(data), null, 4)
        }
        return JSON.stringify(this.inspect(data))
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
    constructor(core, system, success, error) {
        this.core = core
        this.self = {}
        this.over = false
        this.error = error
        this.system = system
        this.success = success
        this.history = new History(this, core)
        this.template = this.system.template.slice()
        this.initContext()
        this.initTimeout()
        this.start()
    }

    initContext() {
        this.context = {
            exit: message => this.finish(true, message),
            fail: message => this.finish(false, message),
            lastCall: null,
            nextCall: null
        }
    }

    initTimeout() {
        if (this.system.timeout == null) {
            return null
        }
        this.timeout = setTimeout(() => this.timeoutHandler(), this.system.timeout)
    }

    timeoutHandler() {
        if (this.over === false) {
            let history = this.history.exports()
            let context = {
                history,
                timeout: true
            }
            this.system.output.call(this.self, context, (result) => {
                this.done()
                this.success(result)
            }, (result) => {
                this.done()
                this.error(result)
            })
        }
    }

    start() {
        this.system.create.call(this.self, this.template)
        this.iterator()
    }

    iterator() {
        if (this.over === false) {
            let template = this.template.shift()
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
            this.context.nextCall = this.template[0] ? this.template[0].name : null
            try {
                template.call(this.self, next, this.context)
            } catch (error) {
                this.done()
                throw new Error(error)
            }
        }
    }

    next() {
        setTimeout(() => {
            if (this.over === false) {
                this.system.middle.call(this.self, this.context)
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
            try {
                this.system.output.call(this.self, context, (result) => {
                    this.done()
                    this.success(result)
                }, (result) => {
                    this.done()
                    this.error(result)
                })
            } catch (error) {
                this.done()
                throw new Error(error)
            }
        }
    }
}

/**
 * Step function can contorl flow
 * @hideconstructor
 */

class Step {
    constructor(packhouse, options) {
        this.core = new StepCore(packhouse, options)
        this.options = options
        packhouse.step = (options) => {
            return this.core.start(options)
        }
    }
}

module.exports = Step