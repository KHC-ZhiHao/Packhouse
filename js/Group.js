/**
 * @class Group
 * @desc 封裝tool的群組，用於歸類與參數設定
 * @argument options 實例化時可以接收以下參數
 * @param {string} alias Group別名
 * @param {object} merger 引用的外部Group
 * @param {function} create 首次使用該Group時呼叫
 */

class Group extends ModuleBase {

    constructor(options = {}) {
        super("Group")
        this.case = new Case()
        this.line = {}
        this.moldbox = {}
        this.toolbox = {}
        this.data = this.$verify(options, {
            alias: [false, 'no_alias_group'],
            merger: [false, {}],
            create: [false, function(){}]
        })
        this.initStatus()
        this.initMerger()
    }

    /**
     * @function initStatus()
     * @private
     * @desc 初始化狀態
     */

    initStatus() {
        this.status = {
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
            if ((group instanceof Group) === false) {
                this.$systemError('initMerger', 'Not a group.', group)
            }
        }
    }

    /**
     * @function alone()
     * @desc 回傳一個獨立的呼叫接口
     */

    alone(options) {
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
        if (this.status.created === false) {
            this.data.create.bind(this.case)(options)
            this.status.created = true
        }
    }

    /**
     * @function getTool
     * @private
     * @param {string} name 獲取Group內的Tool
     */

    getTool(name) {
        if( this.toolbox[name] ){
            return this.toolbox[name]
        } else {
            this.$systemError('getTool', 'Tool not found.', name)
        }
    }

    /**
     * @function getLine
     * @private
     * @param {string} name 獲取Group內的Line
     */

    getLine(name) {
        if( this.line[name] ){
            return this.line[name]
        } else {
            this.$systemError('getLine', 'Line not found.', name)
        }
    }

    /**
     * @function getMold
     * @private
     * @param {string} name 獲取Group內的Mold
     */

    getMold(name) {
        if( this.moldbox[name] ){
            return this.moldbox[name]
        } else {
            this.$systemError('getMold', 'Mold not found.', name)
        }
    }

    /**
     * @function getMerger
     * @private
     * @param {string} name 獲取Group Merger對象宣告的alone
     */

    getMerger(name) {
        if (this.data.merger[name]) {
            return this.data.merger[name].alone()
        } else {
            this.$systemError('getMerger', 'Merger not found.', name)
        }
    }

    /**
     * @function callTool
     * @private
     * @param {string} name 使用Group的Tool
     */

    callTool(name) {
        return this.getTool(name).use()
    }

    /**
     * @function callLine
     * @private
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
        let mold = new Mold(options, this)
        if (this.$noKey('addMold', this.moldbox, mold.name)) {
            this.moldbox[mold.name] = mold
        }
    }

    /**
     * @function addLine
     * @desc 加入一個產線
     * @param {object} options 建立line所需要的物件
     */

    addLine(options){
        let line = new Line(options, this)
        if (this.$noKey('addLine', this.line, line.name)) {
            this.line[line.name] = line
        }
    }

    /**
     * @function addTool
     * @desc 加入一個工具
     * @param {object} options 建立tool所需要的物件
     */

    addTool(options) {
        let tool = new Tool(options, this)
        if( this.$noKey('addTool', this.toolbox, tool.name ) ){
            this.toolbox[tool.name] = tool
        }
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
        return !!this.line[name]
    }

    /**
     * @function hasMold
     * @desc getMode失敗會擲出錯誤，使用這支function來檢查此問題
     * @param {string} name 搜尋目標mold的name
     */

    hasMold(name) {
        return !!this.moldbox[name]
    }

}