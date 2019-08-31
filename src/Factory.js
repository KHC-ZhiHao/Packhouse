const Base = require('./Base')
const Mold = require('./Mold')
const Event = require('./Event')
const Group = require('./Group')
const Utils = require('./Utils')
const Molds = require('./Molds')

class FactoryCore extends Base {
    constructor() {
        super('Factory')
        this.event = new Event(this)
        this.modules = {}
        this.moldbox = new Mold()
        this.groupbox = {}
        for (let key in Molds) {
            this.addMold(key, Molds[key])
        }
    }

    merger(name, data, configs) {
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
            this.addGroup(namespace + key, options.groups[key], configs, namespace)
        }
        this.modules[name] = true
    }

    getGroup(name) {
        if (this.hasGroup(name) === false) {
            this.$devError('getGroup', `Group(${name}) not found.`)
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
                sign: groupDetail[1] ? groupDetail[0] : null,
                name: groupDetail[1] ? groupDetail[1] : groupDetail[0]
            }
        })
        let target = null
        if (type === 'tool') {
            target = this.getGroup(group).callTool(name)
        } else {
            target = this.getGroup(group).callLine(name)
        }
        let action = target.action
        let promise = target.promise
        target.action = (...args) => action(null, ...args)
        target.promise = (...args) => promise(null, ...args)
        return target
    }

    callTool(group, name) {
        return this.getProcess('tool', group, name)
    }

    callLine(group, name) {
        return this.getProcess('line', group, name)
    }

    addGroup(name, groupOptions, configs, namespace) {
        if (typeof name !== 'string') {
            this.$devError('addGroup', `Name(${name}) not a string.`)
        }
        if (this.groupbox[name] != null) {
            this.$devError('addGroup', `Name(${name}) already exists.`)
        }
        this.groupbox[name] = new Group(this, groupOptions, configs, { name, namespace })
    }

    addMold(name, options) {
        this.moldbox.add(name, options)
    }

    hasMold(name) {
        return this.moldbox.has(name)
    }

    hasGroup(name) {
        return !!this.groupbox[name]
    }
}

/**
 * Packhouse Core
 * @hideconstructor
 */

class Factory {
    constructor() {
        this._core = new FactoryCore()
    }

    on(channelName, callback) {
        this._core.event.on(channelName, callback)
    }

    off(channelName, id) {
        this._core.event.off(channelName, id)
    }

    /**
     * 使用tool
     * @param {string} groupName 針對的group對象
     * @param {string} name 真度的tool name
     * @returns {Response}
     */

    tool(groupName, name) {
        return this._core.callTool(groupName, name)
    }

    /**
     * 使用line
     * @param {string} groupName 針對的group對象
     * @param {string} name 針對的line name
     * @returns {Response}
     */

    line(groupName, name) {
        return this._core.callLine(groupName, name)
    }

    /**
     * 引用模組
     * @param {string} name 模組名稱
     * @param {object} options 模組資料
     * @param {object} options.molds
     * @param {object} options.groups
     * @param {object} [configs] 模組通用設定
     */

    merger(name, options, configs) {
        return this._core.merger(name, options, configs)
    }

    /**
     * 加入一則mold
     * @param {string} name mold name
     * @param {object} options mold options
     * @param {function} options.check 驗證正確
     * @param {function} options.casting 型別轉換
     */

    addMold(name, options) {
        return this._core.addMold(name, options)
    }

    /**
     * 加入一條group
     * @param {string} name group name
     * @param {object} groupOptions group options
     * @param {function} groupOptions.install 初始化方法
     * @param {object} [configs] 外部傳遞參數
     */

    addGroup(name, groupOptions, configs) {
        return this._core.addGroup(name, groupOptions, configs)
    }

    /**
     * 是否有該mold
     * @param {string} name mold name
     * @returns {boolean}
     */

    hasMold(name) {
        return this._core.hasMold(name)
    }

    /**
     * 是否有該group
     * @param {string} name group name
     * @returns {boolean}
     */

    hasGroup(name) {
        return this._core.hasGroup(name)
    }
}

module.exports = Factory
