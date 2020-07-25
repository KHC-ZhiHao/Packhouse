const Base = require('./Base')
const Mold = require('./Mold')
const Event = require('./Event')
const Group = require('./Group')
const Utils = require('./Utils')
const Molds = require('./Molds')

class PackhouseCore extends Base {
    constructor(main) {
        super('Packhouse')
        this.main = main
        this.event = new Event(this)
        this.modules = {}
        this.moldbox = new Mold()
        this.groupbox = {}
        this.interceptError = null
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
            molds: [false, ['object'], null],
            groups: [false, ['object'], null]
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
        this._core = new PackhouseCore(this)
        this._plugins = {
            classes: [],
            process: []
        }
    }

    static Main(callback) {
        return (options, mode) => {
            let packhouse = new Packhouse()
            let { plugins, groups, mergers } = callback(packhouse, options, mode)
            if (plugins) {
                for (let plugin of plugins) {
                    packhouse.plugin(plugin)
                }
            }
            if (groups) {
                for (let group in groups) {
                    packhouse.addGroup(group, groups[group])
                }
            }
            if (mergers) {
                for (let merger in mergers) {
                    let data = mergers[merger]()
                    packhouse.merger(merger, data.data, data.options)
                }
            }
            if (mode === 'READ') {
                return { packhouse, plugins, groups, mergers }
            }
            return packhouse
        }
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

    tool(name) {
        let tool = this._core.callTool(...name.split('/'))
        let action = tool.action
        let promise = tool.promise
        tool.action = (...args) => action(null, ...args)
        tool.promise = (...args) => promise(null, ...args)
        return tool
    }

    line(name) {
        return (...args) => this._core.callLine(...name.split('/'))(null, ...args)
    }

    plugin(Plugin) {
        if (this._plugins.classes.includes(Plugin) === false) {
            this._plugins.classes.push(Plugin)
            this._plugins.process.push(new Plugin(this))
        }
    }

    merger(name, data, configs) {
        return this._core.merger(name, data, configs)
    }

    addMold(name, handler) {
        return this._core.addMold(name, handler)
    }

    addGroup(name, install) {
        return this._core.addGroup(name, install)
    }

    hasMold(name) {
        return this._core.hasMold(name)
    }

    hasGroup(name) {
        return this._core.hasGroup(name)
    }

    interceptError(callback) {
        if (typeof callback === 'function') {
            this._core.interceptError = callback
        } else {
            this.$devError('interceptError', 'Callback not a function.')
        }
    }
}

Packhouse.utils = Utils

module.exports = Packhouse
