/**
 * @class Packhouse
 * @desc 主核心，實體化名為Factory
 */

class Packhouse extends ModuleBase {

    /**
     * @member {object} groups group的集結包
     * @member {function} bridge 每次請求時的一個呼叫函數
     */

    constructor(options = {}) {
        super("Factory")
        this.groups = {}
        this.bridge = null
        if (options.bridge) {
            this.setBridge(options.bridge)
        }
    }

    /**
     * @function registerModuleMerger(name,action)
     * @static
     * @desc 建立module merger
     */

    static registerModuleMerger(name, action) {
        ModuleMergers.register(name, action)
    }

    /**
     * @function createPublicMold(moldOptions)
     * @static
     * @desc 建立public mold
     */

    static createPublicMold(options) {
        let mold = new Mold(options)
        if (PublicMolds[mold.name]) {
            throw new Error(`(☉д⊙)!! PackHouse::createPublicMold -> Public mold name(${mold.name}) already exists.`)
        } else {
            PublicMolds[mold.name] = mold
        }
    }

    /**
     * @function createOrder(options)
     * @static
     * @desc 建立一個order
     */

    static createOrder(options) {
        let order = new Order(options)
        return new OrderExports(order)
    }

    /**
     * @function createGroup(options)
     * @static
     * @desc 建立一個Group
     */

    static createGroup(options) {
        let group = new Group(options)
        return new GroupExports(group)
    }

    /**
     * @function createFactory(options)
     * @static
     * @desc 建立一個Factory
     */

    static createFactory(options) {
        let factory = new Packhouse(options)
        return new FactoryExports(factory)
    }

    /**
     * @function isFactory(factory)
     * @static
     * @desc 確認是一個Factory
     */

    static isFactory(factory) {
        return factory instanceof Packhouse || factory instanceof FactoryExports
    }

    /**
     * @function isGroup(group)
     * @static
     * @desc 確認是一個Group
     */

    static isGroup(group) {
        return Group.isGroup(group)
    }

    /**
     * @function asyncLoop(target,action,callback)
     * @static
     * @desc 非同步迴圈
     */

    static asyncLoop(target, action, callback) {
        if (Array.isArray(target) === false) {
            callback('AsyncLoop : Targrt not be array.')
            return
        }
        if (typeof action !== "function" || typeof callback !== "function") {
            callback('AsyncLoop : Action or callback not a function.')
            return
        }
        let length = target.length
        let onload = 0
        let onloadCallback = () => {
            onload += 1
            if (onload === length) {
                callback()
            }
        }
        let doing = async(target, index) => {
            action(target, index, onloadCallback)
        }
        for (let i = 0; i < length; i++) {
            doing(target[i], i)
        }
        if (length === 0) {
            callback()
        }
    }

    /**
     * @function createPump(total,callback)
     * @static
     * @desc 建立計數幫浦
     */

    static createPump(total, callback) {
        return (new Pump(total, callback)).exports
    }

    /**
     * @function getGroup(name)
     * @private
     * @desc 獲取一個Group
     */

    getGroup(name) {
        if (this.hasGroup(name)) {
            return this.groups[name]
        } else {
            this.$systemError('getGroup', `Group(${name}) not found.`)
        }
    }

    /**
     * @function getTool(groupName,name)
     * @private
     * @desc 獲取一個Tool
     */

    getTool(groupName, name) {
        return this.getGroup(groupName).callTool(name)
    }

    /**
     * @function getLine(groupName,name)
     * @private
     * @desc 獲取一個Line
     */

    getLine(groupName, name) {
        return this.getGroup(groupName).callLine(name)
    }

    /**
     * @function addGroup(name,group,options)
     * @desc 加入一個Group
     * @param {object} options group被初始化時能夠接收到的外部物件
     */

    addGroup(name, group, options) {
        if (this.groups[name] != null){
            return this.$systemError('addGroup', `Name(${name}) already exists.`)
            
        }
        if (Group.isGroup(group) === false) {
            return this.$systemError('addGroup', 'Must group.', group)
        }
        if (group.isModule()) {
            return this.$systemError('addGroup', 'Group id module, only use alone or in the merger.', group)
        }
        group.create(options)
        this.groups[name] = group
    }

    /**
     * @function removeGroup(name)
     * @desc 移除一個Group
     */

    removeGroup(name) {
        if (this.groups[name]) {
            this.groups[name] = null
        } else {
            this.$systemError('removeGroup', `Group(${name}) not found.`)
        }
    }

    /**
     * @function hasGroup(name)
     * @desc 加入一個Group
     */

    hasGroup(name) {
        return !!this.groups[name]
    }

    /**
     * @function hasTool(groupName,name)
     * @desc 有無Tool
     */

    hasTool(groupName, name) {
        return !!this.getGroup(groupName).hasTool(name)
    }

    /**
     * @function hasLine(groupName,name)
     * @desc 有無Line
     */

    hasLine(groupName, name) {
        return !!this.getGroup(groupName).hasLine(name)
    }

    /**
     * @function tool(groupName,name)
     * @desc 呼叫一個tool
     */

    tool(groupName, name) {
        this.callBridge(groupName, name)
        return this.getTool(groupName, name)
    }

    /**
     * @function line(groupName,name)
     * @desc 呼叫一個line
     */

    line(groupName, name) {
        this.callBridge(groupName, name)
        return this.getLine(groupName, name)
    }

    /**
     * @function callBridge
     * @private
     * @desc 呼叫橋接器
     */

    callBridge(groupName, name) {
        if (this.bridge) {
            this.bridge(this, groupName, name)
        }
    }

    /**
     * @function setBridge
     * @desc 建立橋接器，在任何呼叫前執行一個function
     * @param {function} bridge 呼叫函式
     */

    setBridge(bridge) {
        if (typeof bridge === 'function') {
            this.bridge = bridge
        } else {
            this.$systemError('setBridge', 'Bridge not a function.', bridge)
        }
    }

}
