const Base = require('./Base')
const Mold = require('./Mold')
const Group = require('./Group')
const Event = require('./Event')
const Configs = require('./Configs')

class FactoryCore extends Base {
    constructor() {
        super('Factory')
        this.event = new Event(this)
        this.event.addChannel('error')
        this.event.addChannel('success')
        this.event.addChannel('use-before')
        this.event.addChannel('action-tool-before')
        this.event.addChannel('action-line-before')
        this.modules = {}
        this.moldbox = {}
        this.groupbox = {}
        for (let key in Configs.defaultMolds) {
            this.addMold(key, Configs.defaultMolds[key])
        }
    }

    on(name, callback) {
        this.event.on(name, callback)
    }

    emit(name, data) {
        this.event.broadcast(name, data)
    }

    merger(name, data, configs) {
        if (this.modules[name]) {
            this.$systemError('join', `Name(${name}) already exists.`)
        }
        let namespace = name + '@'
        let options = this.$verify(data, {
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
            this.$systemError('getGroup', `Group(${name}) not found.`)
        }
        return this.groupbox[name]
    }

    getMold(name) {
        if (this.hasMold(name) === false) {
            this.$systemError('getMold', `Mold(${name}) not found.`)
        }
        return this.moldbox[name]
    }

    getCoop(groupName, context) {
        return {
            tool: (name) => { return this.callTool(groupName, name, context) },
            line: (name) => { return this.callLine(groupName, name, context) }
        }
    }

    emitCall(type, options) {
        this.emit('use-before', { type, ...options })
    }

    callTool(groupName, name, context) {
        this.emitCall('tool', { groupName, toolName: name, context })
        return this.getGroup(groupName).callTool(name, context)
    }

    callLine(groupName, name, context) {
        this.emitCall('line', { groupName, toolName: name, context })
        return this.getGroup(groupName).callLine(name, context)
    }

    addGroup(name, groupOptions, configs, namespace) {
        if (this.groupbox[name] != null) {
            this.$systemError('addGroup', `Name(${name}) already exists.`)
        }
        this.groupbox[name] = new Group(this, groupOptions, configs, { name, namespace })
    }

    addMold(name, options) {
        if (this.hasMold(name)) {
            this.$systemError('addMold', `Name(${name}) already exists.`)
        }
        this.moldbox[name] = new Mold(options)
    }

    hasMold(name) {
        return !!this.moldbox[name]
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

    /**
     * 監聽事件
     * @param {string} name 事件名稱
     * @param {function} callback 觸發回呼事件
     * @example
     * factory.on('use-before', (context) => {})
     * factory.on('action-tool-before', (context) => {})
     * factory.on('action-line-before', (context) => {})
     */

    on(name, callback) {
        this._core.on(name, callback)
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
