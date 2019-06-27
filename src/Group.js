const Base = require('./Base')
const Tool = require('./Tool')
const Line = require('./Line')
const Mold = require('./Mold')

class GroupStore {}
class Group extends Base {
    constructor(factory, data = {}, configs = {}, namespace) {
        super('Group')
        this.namespace = namespace ? namespace + '@' : ''
        this.store = new GroupStore()
        this.factory = factory
        this.toolbox = {}
        this.linebox = {}
        this.moldbox = {}
        this.options = this.$verify(data, {
            alias: [false, ['string'], 'no_alias_group'],
            tools: [false, ['object'], {}],
            lines: [false, ['object'], {}],
            molds: [false, ['object'], {}],
            install: [false, ['function'], () => {}]
        })
        this.init()
        this.options.install(this.store, configs)
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

    getTool(name) {
        if (this.hasTool(name) === false) {
            this.$systemError('getTool', `Tool(${name}) not found.`)
        }
        return this.toolbox[name]
    }

    getLine(name) {
        if (this.hasLine(name) === false) {
            this.$systemError('getLine', `Line(${name}) not found.`)
        }
        return this.linebox[name]
    }

    getMold(name) {
        if (this.hasMold(name) === false) {
            this.$systemError('getMold', `Mold(${name}) not found.`)
        }
        return this.moldbox[name] || this.factory.getMold(this.namespace + name)
    }

    getCoop(name) {
        return this.factory.getCoop(this.namespace + name)
    }

    callTool(name) {
        return this.getTool(name).use()
    }

    callLine(name) {
        return this.getLine(name).use()
    }

    addTool(name, options) {
        if (this.hasTool(name)) {
            this.$systemError('addTool', `Name(${name}) already exists.`)
        }
        this.toolbox[name] = new Tool(this, options)
    }

    addLine(name, options) {
        if (this.hasLine(name)) {
            this.$systemError('addLine', `Name(${name}) already exists.`)
        }
        this.linebox[name] = new Line(this, options)
    }

    addMold(name, options) {
        if (this.hasMold(name)) {
            this.$systemError('addMold', `Name(${name}) already exists.`)
        }
        this.moldbox[name] = new Mold(options)
    }

    hasTool(name) {
        return !!this.toolbox[name]
    }

    hasLine(name) {
        return !!this.linebox[name]
    }

    hasMold(name) {
        return !!(this.moldbox[name] || this.factory.hasMold(this.namespace + name))
    }
}

module.exports = Group
