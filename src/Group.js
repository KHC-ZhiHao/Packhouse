const Base = require('./Base')
const Tool = require('./Tool')
const Line = require('./Line')
const Mold = require('./Mold')
const Utils = require('./Utils')

class GroupStore {}
class Group extends Base {
    constructor(factory, data = {}, configs = {}, context = {}) {
        super('Group')
        this.name = context.name.replace(context.namespace || '', '')
        this.sign = context.name.match('@') ? context.name.split('@')[0] : ''
        this.namespace = context.namespace || ''
        this.store = new GroupStore()
        this.factory = factory
        this.toolbox = {}
        this.linebox = {}
        this.moldbox = new Mold(this.factory.moldbox, this.namespace)
        this.options = Utils.verify(data, {
            tools: [false, ['object'], {}],
            lines: [false, ['object'], {}],
            molds: [false, ['object'], {}],
            mergers: [false, ['object'], {}],
            install: [false, ['function'], () => {}]
        })
        this.init()
        this.options.install.call(this.store, this.store, configs)
    }

    init() {
        this.initTools()
        this.initLines()
        this.initMolds()
        this.options.tools = null
    }

    initTools() {
        let tools = this.options.tools
        for (let name in tools) {
            this.addTool(name, tools[name])
        }
    }

    initLines() {
        let lines = this.options.lines
        for (let name in lines) {
            this.addLine(name, lines[name])
        }
    }

    initMolds() {
        let molds = this.options.molds
        for (let name in molds) {
            this.addMold(name, molds[name])
        }
    }

    parseMold(name, value, index, callback) {
        return this.moldbox.parse(name, value, index, callback)
    }

    getTool(name) {
        if (this.hasTool(name) === false) {
            this.$devError('getTool', `Tool(${name}) not found.`)
        }
        return this.toolbox[name]
    }

    getLine(name) {
        if (this.hasLine(name) === false) {
            this.$devError('getLine', `Line(${name}) not found.`)
        }
        return this.linebox[name]
    }

    callCoop(name) {
        return this.factory.getCoop(this.namespace + this.options.mergers[name])
    }

    callTool(name) {
        return this.getTool(name).use()
    }

    callLine(name) {
        return this.getLine(name).use()
    }

    addTool(name, options) {
        if (this.hasTool(name)) {
            this.$devError('addTool', `Name(${name}) already exists.`)
        }
        this.toolbox[name] = new Tool(this, options, name)
    }

    addLine(name, options) {
        if (this.hasLine(name)) {
            this.$devError('addLine', `Name(${name}) already exists.`)
        }
        this.linebox[name] = new Line(this, options, name)
    }

    addMold(name, options) {
        this.moldbox.add(name, options)
    }

    hasTool(name) {
        return !!this.toolbox[name]
    }

    hasLine(name) {
        return !!this.linebox[name]
    }

    hasMold(name) {
        return this.moldbox.has(name)
    }
}

module.exports = Group
