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
            template: [true, ['array']]
        })
        return new Promise((resolve, reject) => {
            new Flow(this, system, resolve, reject)
        })
    }
}

class History {
    constructor(flow, { packhouse }) {
        this.list = []
        this.flow = flow
        this.index = 0
        this.startTime = Date.now()
        this.packhouse = packhouse
    }

    inspect(target, lite, used = []) {
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
                    output[key] = this.inspect(aims, lite, newUsed)
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

    exports(fail, message, timeout) {
        let now = Date.now()
        let profile = {
            fail,
            message,
            timeout,
            startTime: this.startTime,
            finishTime: now,
            totalTime: now - this.startTime
        }
        return {
            _core: this,
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
            log.success = detail.success
            log.resultType = this.packhouse.utils.getType(detail.result)
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
        this.nextProcess = () => {
            if (this.over === false) {
                this.system.middle.call(this.self, this.self, this.context)
                this.iterator()
            }
        }
        this.initContext()
        this.initTimeout()
        this.start()
    }

    initContext() {
        this.context = {
            exit: message => this.finish(false, message),
            fail: message => this.finish(true, message),
            lastCall: null,
            nextCall: null
        }
    }

    initTimeout() {
        if (this.system.timeout == null) {
            return null
        }
        this.timeout = setTimeout(() => {
            this.timeoutHandler()
        }, this.system.timeout)
    }

    timeoutHandler() {
        if (this.over === false) {
            let history = this.history.exports(true, 'timeout', true)
            let context = {
                history,
                timeout: true
            }
            this.over = true
            this.system.output.call(this.self, this.self, context, (result) => {
                this.done()
                this.success(result)
            }, (result) => {
                this.done()
                this.error(result)
            })
        }
    }

    start() {
        this.system.create.call(this.self, this.self, this.core.packhouse)
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
                this.history.output()
                this.next()
            }
            this.history.input({ name: template.name })
            this.context.lastCall = template.name || null
            this.context.nextCall = this.template[0] ? this.template[0].name : null
            template.call(this.self, this.self, () => {
                next()
                next = () => {
                    throw new Error('Packhouse Step : Next called multiple times.')
                }
            }, this.context)
        }
    }

    next() {
        if (process && process.nextTick) {
            process.nextTick(this.nextProcess)
        } else {
            setTimeout(this.nextProcess, 1)
        }
    }

    done() {
        if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
        }
    }

    finish(fail, message) {
        let history = this.history.exports(fail, message, false)
        let context = {
            fail,
            message,
            history,
            timeout: false
        }
        if (this.over === false) {
            this.over = true
            this.system.output.call(this.self, this.self, context, (result) => {
                this.done()
                this.success(result)
            }, (result) => {
                this.done()
                this.error(result)
            })
        }
    }
}

class Step {
    constructor(packhouse) {
        this.core = new StepCore(packhouse)
        packhouse.step = (options) => {
            return this.core.start(options)
        }
    }
}

module.exports = Step
