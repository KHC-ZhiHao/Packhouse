const Base = require('./Base')
const Mold = require('./Mold')
const Event = require('./Event')
const Group = require('./Group')
const Utils = require('./Utils')
const Molds = require('./Molds')

class PackhouseCore extends Base {
    constructor() {
        super('Packhouse')
        this.event = new Event(this)
        this.modules = {}
        this.moldbox = new Mold()
        this.groupbox = {}
        for (let key in Molds) {
            this.addMold(key, Molds[key])
        }
    }

    merger(name, data, configs = {}) {
        if (this.modules[name]) {
            this.$devError('merger', `Name(${name}) already exists.`)
        }
        let namespace = name + '@'
        let options = Utils.verify(data, {
            molds: [false, ['object'], {}],
            groups: [false, ['object'], {}]
        })
        for (let key in options.molds) {
            this.addMold(namespace + key, options.molds[key])
        }
        for (let key in options.groups) {
            this.addGroup(namespace + key, options.groups[key], namespace, configs)
        }
        this.modules[name] = true
    }

    getGroup(name) {
        if (this.hasGroup(name) === false) {
            this.$devError('getGroup', `Group(${name}) not found.`)
        }
        if (typeof this.groupbox[name] === 'function') {
            this.groupbox[name]()
        }
        return this.groupbox[name]
    }

    getCoop(groupName) {
        return {
            tool: name => this.callTool(groupName, name),
            line: name => this.callLine(groupName, name)
        }
    }

    getProcess(type, group, name) {
        let groupDetail = group.split('@')
        this.event.emit('use', {
            type,
            name,
            group: {
                sign: groupDetail[1] ? groupDetail[0] : '',
                name: groupDetail[1] ? groupDetail[1] : groupDetail[0]
            }
        })
        let target = null
        if (type === 'tool') {
            target = this.getGroup(group).callTool(name)
        } else {
            target = this.getGroup(group).callLine(name)
        }
        return target
    }

    callTool(group, name) {
        return this.getProcess('tool', group, name)
    }

    callLine(group, name) {
        return this.getProcess('line', group, name)
    }

    addGroup(name, install, namespace, configs) {
        if (typeof name !== 'string') {
            this.$devError('addGroup', `Name(${name}) not a string.`)
        }
        if (this.groupbox[name] != null) {
            this.$devError('addGroup', `Name(${name}) already exists.`)
        }
        this.groupbox[name] = () => {
            let data = install(configs)
            this.groupbox[name] = new Group(this, data.data, data.options, { name, namespace })
        }
    }

    addMold(name, handler) {
        this.moldbox.add(name, handler)
    }

    hasMold(name) {
        return this.moldbox.has(name)
    }

    hasGroup(name) {
        return !!this.groupbox[name]
    }
}

class Packhouse {
    constructor() {
        this._core = new PackhouseCore()
    }

    get utils() {
        return Utils
    }

    on(channelName, callback) {
        return this._core.event.on(channelName, callback)
    }

    off(channelName, id) {
        return this._core.event.off(channelName, id)
    }

    tool(groupName, name) {
        let tool = this._core.callTool(groupName, name)
        let action = tool.action
        let promise = tool.promise
        tool.action = (...args) => action(null, ...args)
        tool.promise = (...args) => promise(null, ...args)
        return tool
    }

    line(groupName, name) {
        return (...args) => this._core.callLine(groupName, name)(null, ...args)
    }

    plugin(Plugin, options) {
        new Plugin(this, options)
    }

    merger(name, options, configs) {
        return this._core.merger(name, options, configs)
    }

    addMold(name, handler) {
        return this._core.addMold(name, handler)
    }

    addGroup(name, install) {
        return this._core.addGroup(name, install)
    }

    add(name, install) {
        return this._core.addGroup(name, install)
    }

    hasMold(name) {
        return this._core.hasMold(name)
    }

    hasGroup(name) {
        return this._core.hasGroup(name)
    }
}

Packhouse.utils = Utils
Packhouse.groupFormat = (data) => {
    return Object.assign({
        tools: {},
        lines: {},
        molds: {},
        mergers: {},
        install: () => {}
    }, data)
}

module.exports = Packhouse
