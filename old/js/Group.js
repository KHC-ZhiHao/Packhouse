/**
 * @class Group
 * @desc 封裝tool的群組，用於歸類與參數設定
 * @argument options 實例化時可以接收以下參數
 * @param {string} alias Group別名
 * @param {object} merger 引用的外部Group
 * @param {boolean} module 使否為模組
 * @param {boolean} secure 是否使用安全模式
 * @param {function} create 首次使用該Group時呼叫
 */

class Group extends ModuleBase {

    constructor(options = {}) {
        super("Group")
        this.case = new Case()
        this.data = this.$verify(options, {
            alias: [false, ['string'], 'no_alias_group'],
            module: [false, ['boolean'], false],
            secure: [false, ['boolean'], false],
            merger: [false, ['object'], {}],
            create: [false, ['function'], function(){}]
        })
        this.toolbox = {}
        this.moldbox = {}
        this.linebox = {}
        this.initStatus()
        this.initMerger()
    }

    static isGroup(group) {
        return group instanceof Group || group instanceof GroupExports
    }

    /**
     * @function getProfile()
     * @desc 獲取group的資料
     */

    getProfile() {
        let profile = {
            line: {},
            mold: {},
            tool: {},
            alias: this.data.alias
        }
        for (let key in this.toolbox) {
            profile.tool[key] = this.getTool(key).getProfile()
        }
        for (let key in this.moldbox) {
            profile.mold[key] = this.getMold(key).getProfile()
        }
        for (let key in this.linebox) {
            profile.line[key] = this.getLine(key).getProfile()
        }
        return profile
    }

    /**
     * @function compileLazy
     * @desc 由此實現懶加載的驗證
     */

    compileLazy(name, target, module) {
        if (typeof target[name] === 'function') {
            target[name] = new module({ name, ...target[name]() }, this)
        }
        return target[name]
    }

    /**
     * @function replace(name,optnios)
     * @desc 使否為模組狀態
     */

    replaceTool(name, optnios) {
        let tool = this.getTool(name)
        tool.replace(optnios)
    }

    /**
     * @function isModule()
     * @private
     * @desc 使否為模組狀態
     */

    isModule() {
        return !!this.data.module
    }

    /**
     * @function initStatus()
     * @private
     * @desc 初始化狀態
     */

    initStatus() {
        this.exportCase = this.data.secure ? this.$protection(this.case) : this.case
        this.status = {
            alone: false,
            created: false
        }
    }

    /**
     * @function initMerger()
     * @private
     * @desc 檢查Merger是否正確
     */

    initMerger() {
        for (let key in this.data.merger) {
            let group = this.data.merger[key]
            let type = typeof group
            if (Group.isGroup(group) === false && !(type === 'function' || type === 'string')) {
                this.$systemError('initMerger', `The '${key}' not a group or function.`)
            }
        }
    }

    /**
     * @function alone()
     * @desc 回傳一個獨立的呼叫接口
     */

    alone(options) {
        this.status.alone = true
        this.create(options)
        return {
            tool: this.callTool.bind(this),
            line: this.callLine.bind(this)
        }
    }

    /**
     * @function create
     * @private
     * @desc 當Group首次宣告alone或引入factory時呼叫
     */

    create(options) {
        let check = options && this.isModule()
        if (check && options.__module_group__ !== true) {
            return this.$systemError('create', `Module mode group can't use options`)
        }
        if (check && options.__module_group__ === true && this.status.alone) {
            return this.$systemError('create', `Module already use, can't be announced as module merger.`)
        }
        if (check && options.__module_group__ === true) {
            delete options.__module_group__
        }
        if (this.status.created === true) {
            return null
        }
        this.data.create.bind(this.case)(options)
        this.status.created = true
    }

    /**
     * @function getTool
     * @private
     * @param {string} name 獲取Group內的Tool
     */

    getTool(name) {
        if (this.toolbox[name]) {
            return this.compileLazy(name, this.toolbox, Tool)
        } else {
            this.$systemError('getTool', `Tool(${name}) not found.`)
        }
    }

    /**
     * @function getLine
     * @private
     * @param {string} name 獲取Group內的Line
     */

    getLine(name) {
        if (this.linebox[name]) {
            return this.compileLazy(name, this.linebox, Line)
        } else {
            this.$systemError('getLine', `Line(${name}) not found.`)
        }
    }

    /**
     * @function getMold
     * @private
     * @param {string} name 獲取Group內的Mold
     */

    getMold(name) {
        let mold = this.moldbox[name] || PublicMolds[name] || null
        if (mold) {
            return mold
        } else {
            this.$systemError('getMold', `Mold(${name}) not found.`)
        }
    }

    /**
     * @function getMerger
     * @private
     * @param {string} name 獲取Group Merger對象宣告的alone
     */

    getMerger(name) {
        if (this.data.merger[name]) {
            // Public Mergers
            if (typeof this.data.merger[name] === 'string') {
                this.data.merger[name] = ModuleMergers.get(this.data.merger[name])
            }
            // Lazy Merger
            if (typeof this.data.merger[name] === 'function') {
                let group = this.data.merger[name]()
                if (Group.isGroup(group) === false) {
                    this.$systemError('getMerger', `The '${name}' not a group.`)
                }
                this.data.merger[name] = group
            }
            return this.data.merger[name].alone()
        } else {
            this.$systemError('getMerger', `Merger(${name}) not found.`)
        }
    }

    /**
     * @function callTool
     * @param {string} name 使用Group的Tool
     */

    callTool(name) {
        return this.getTool(name).use()
    }

    /**
     * @function callLine
     * @param {string} name 使用Group的Tool
     */

    callLine(name) {
        return this.getLine(name).use()
    }

    /**
     * @function addMold
     * @desc 加入一個模具
     * @param {object} options 建立mold所需要的物件
     */

    addMold(options) {
        let mold = new Mold(options)
        if (this.$noKey('addMold', this.moldbox, mold.name)) {
            this.moldbox[mold.name] = mold
        }
    }

    /**
     * @function addMolds
     * @desc 加入多個模塊
     * @param {object|array} molds 建立mold所需要多個物件
     */

    addMolds(molds) {
        if (Array.isArray(molds)) {
            for (let mold of molds) {
                this.addMold(mold)
            }
            return true
        }
        if (typeof molds === 'object') {
            for (let key in molds) {
                this.addMold({ name: key, ...molds[key] })
            }
            return true
        }
        this.$systemError('addMolds', 'Molds not a array or object.', molds)
    }

    /**
     * @function addLine
     * @desc 加入一個產線
     * @param {object} options 建立line所需要的物件
     */

    addLine(...options){
        if (typeof options[0] === 'string') {
            this.addLineLazy(options[0], options[1])
        } else {
            let line = new Line(options[0], this)
            if (this.$noKey('addLine', this.linebox, line.name)) {
                this.linebox[line.name] = line
            }
        }
    }

    /**
     * @function addLineLazy
     * @private
     * @desc 用懶加載模式加入一個產線
     */

    addLineLazy(name, callback) {
        if (typeof callback === 'function') {
            if (this.$noKey('addLineLazy', this.linebox, name)) {
                this.linebox[name] = callback
            }
        } else {
            this.$systemError('addLineLazy', 'Callback not a function.')
        }
    }

    /**
     * @function addLines
     * @desc 加入多個產線
     * @param {object|array} options 建立line所需要的物件
     */

    addLines(lines){
        if (Array.isArray(lines)) {
            for (let line of lines) {
                this.addLine(line)
            }
            return true
        }
        if (typeof lines === 'object') {
            for (let key in lines) {
                if (typeof lines[key] === 'function') {
                    this.addLineLazy(name, lines[key])
                } else {
                    this.addLine({ name: key, ...lines[key] })
                }
            }
            return true
        }
        this.$systemError('addLines', 'Lines not a array or object.', lines)
    }

    /**
     * @function addTool
     * @desc 加入一個工具
     * @param {object} options 建立tool所需要的物件
     */

    addTool(...options) {
        if (typeof options[0] === 'string') {
            this.addToolLazy(options[0], options[1])
        } else {
            let tool = new Tool(options[0], this)
            if (this.$noKey('addTool', this.toolbox, tool.name)) {
                this.toolbox[tool.name] = tool
            }
        }
    }

    /**
     * @function addToolLazy
     * @private
     * @desc 用懶加載模式加入一個工具
     */

    addToolLazy(name, callback) {
        if (typeof callback === 'function') {
            if (this.$noKey('addToolLazy', this.toolbox, name)) {
                this.toolbox[name] = callback
            }
        } else {
            this.$systemError('addToolLazy', 'Callback not a function.')
        }
    }

    /**
     * @function addTools
     * @desc 加入多個工具
     * @param {object|array} tools 建立tool所需要多個物件
     */

    addTools(tools) {
        if (Array.isArray(tools)) {
            for (let tool of tools) {
                this.addTool(tool)
            }
            return true
        }
        if (typeof tools === 'object') {
            for (let key in tools) {
                if (typeof tools[key] === 'function') {
                    this.addToolLazy(name, tools[key])
                } else {
                    this.addTool({ name: key, ...tools[key] })
                }
            }
            return true
        }
        this.$systemError('addTools', 'Tools not a array or object.', tools)
    }

    /**
     * @function hasTool
     * @desc getTool失敗會擲出錯誤，使用這支function來檢查此問題
     * @param {string} name 搜尋目標line的name
     */

    hasTool(name) {
        return !!this.toolbox[name]
    }

    /**
     * @function hasLine
     * @desc getLine失敗會擲出錯誤，使用這支function來檢查此問題
     * @param {string} name 搜尋目標line的name
     */

    hasLine(name) {
        return !!this.linebox[name]
    }

    /**
     * @function hasMold
     * @desc getMode失敗會擲出錯誤，使用這支function來檢查此問題
     * @param {string} name 搜尋目標mold的name
     */

    hasMold(name) {
        return !!this.moldbox[name]
    }

    /**
     * @function updateCall
     * @private
     * @desc 指定tool update
     */

    updateCall(name) {
        this.getTool(name).update()
    }

}