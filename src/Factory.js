const Base = require('./Base')
const Mold = require('./Mold')
const Group = require('./Group')
const Configs = require('./Configs')

class FactoryCore extends Base {
    constructor() {
        super('Factory')
        this.moldbox = {}
        this.groupbox = {}
        for (let key in Configs.defaultMolds) {
            this.addMold(key, Configs.defaultMolds[key])
        }
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

    getMerger(groupName) {
        return {
            tool: (name) => { this.callTool(groupName, name) },
            line: (name) => { this.callLine(groupName, name) }
        }
    }

    callTool(groupName, name) {
        return this.getGroup(groupName).callTool(name)
    }

    callLine(groupName, name) {
        return this.getGroup(groupName).callLine(name)
    }

    addGroup(name, groupOptions, options) {
        if (this.groupbox[name] != null) {
            this.$systemError('addGroup', `Name(${name}) already exists.`)
        }
        this.groupbox[name] = new Group(this, groupOptions, options)
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

class Factory {
    constructor() {
        this._core = new FactoryCore()
    }

    tool(groupName, name) {
        return this._core.callTool(groupName, name)
    }

    line(groupName, name) {
        return this._core.callLine(groupName, name)
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
     * @param {string} groupOptions.alias group的別名，用於訊息輸出
     * @param {function} groupOptions.install 初始化方法
     * @param {object} [options] 外部傳遞參數
     */

    addGroup(name, groupOptions, options) {
        return this._core.addGroup(name, groupOptions, options)
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
