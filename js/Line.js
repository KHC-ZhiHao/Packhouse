/**
 * @class Line
 * @desc Line是個累人的工程，複雜的建置，複雜的宣告，但辛苦會有結果的
 * @argument options 實例化時可以接收以下參數
 * @param {string} name 模具名稱
 * @param {array} inlet 進入口
 * @param {function} fail 失敗的回乎函數
 * @param {function} input 初始化的回乎函數
 * @param {function} output 輸出的回乎函數
 * @param {function} layout 能夠呼叫的function
 */

class Line extends ModuleBase {

    constructor(options, group) {
        super("Line");
        this.tools = {}
        this.group = group
        this.data = this.$verify(options, {
            name: [true, ['string']],
            fail: [true, ['function']],
            inlet: [false, ['object'], null],
            input: [true, ['object', 'function']],
            output: [true, ['object', 'function']],
            layout: [true, ['object']]
        })
        this.layoutKeys = Object.keys(this.data.layout)
        this.checkPrivateKey()
    }

    get name() { return this.data.name }

    /**
     * @function getProfile()
     * @desc 獲取line的資料
     */

    getProfile() {
        return {
            name: this.data.name,
            inlet: this.data.inlet,
            layouts: Object.keys(this.data.layout)
        }
    }

    /**
     * @function checkPrivateKey
     * @private
     * @desc action, promise, setRule是不允許被放在layout的
     */

    checkPrivateKey() {
        let layout = this.data.layout
        if (layout.action || layout.promise || layout.setRule) {
            this.$systemError('init', 'Layout has private key(action, promise, setRule)')
        }
    }

    /**
     * @function use
     * @private
     * @desc Line的對外接口
     */

    use() {
        return (...options) => {
            return (new Deploy(this, options)).conveyer
        }
    }

}

/**
 * @class Deploy
 * @desc Deploy是Line作為實際運行的物件
 */

class Deploy extends ModuleBase {

    /**
     * @member {array} flow 為放置行為的容器
     * @member {number} index
     */

    constructor(main, params) {
        super("Unit")
        this.case = new Case()
        this.flow = []
        this.main = main
        this.layout = main.data.layout
        this.params = params
        this.supports = new Support()
        this.init()
    }

    /**
     * @function createTool
     * @private
     * @desc 實例化layout
     */

    createTool(name, target, nonTool) {
        if (typeof target === 'function') {
            return (new Tool({ name, action: target }, this.main.group, this.case)).use()
        } else if (nonTool) {
            this.$systemError('createTool', `${name} not a function.`)
        } else {
            if (target.name) {
                delete target.name
            }
            return (new Tool({ name, ...target }, this.main.group, this.case)).use()
        }
    }

    /**
     * @function init
     * @private
     * @desc 初始化I/O
     */

    init() {
        this.input = this.createTool('input', this.main.data.input)
        this.output = this.createTool('output', this.main.data.output, true)
        this.initConveyer()
    }

    /**
     * @function initConveyer
     * @private
     * @desc 初始化輸送帶
     */

    initConveyer() {
        this.conveyer = {
            action: this.action.bind(this),
            promise: this.promise.bind(this),
            setRule: this.setRule.bind(this)
        }
        for (let name of this.main.layoutKeys) {
            this.conveyer[name] = (...options) => {
                this.register(name, options)
                return this.conveyer
            }
        }
    }

    /**
     * @function register
     * @private
     * @desc 註冊一個flow
     */

    register(name, params) {
        let inlet = this.main.data.inlet
        if (inlet && inlet.length !== 0 && this.flow.length === 0) {
            if (inlet.includes(name) === false) {
                this.$systemError('register', `First call method not inside inlet, you use '${name}'.`)
            }
        }
        this.flow.push({
            name: name,
            method: this.createTool(name, this.layout[name]),
            params: params
        })
    }

    /**
     * @function action
     * @private
     * @desc 執行有回乎函數的動作
     */

    action(callback) {
        let fail = this.main.data.fail
        let supports = this.supports.copy()
        let response = (new ResponseAction(this.main.group, supports, callback)).exports
        this.process(error => fail(error, response.error), response.success)
    }

    /**
     * @function action
     * @private
     * @desc 執行回傳Promise的動作
     */

    promise() {
        return new Promise(( resolve, reject ) => {
            let fail = this.main.data.fail
            let supports = this.supports.copy()
            let response = (new ResponsePromise(this.main.group, supports, resolve, reject)).exports
            this.process(error => fail(error, response.error), response.success)
        })
    }

    /**
     * @function setRule
     * @private
     * @desc 效力等同rule(ng, sop, ngOptions)
     */

    setRule(...options) {
        this.supports.setRule(...options)
        return this.conveyer
    }

    /**
     * @function process
     * @private
     * @desc process是一個包裝執行過程的物件
     */

    process(error, success) {
        (new Process(this.params, this.flow, this.input, this.output)).start(error, success)
    }

}

/**
 * @class Process
 * @desc process是一個包裝執行過程的物件
 */

class Process extends ModuleBase {

    constructor(params, flow, input, output) {
        super('Process')
        this.stop = false
        this.flow = flow
        this.index = 0
        this.stack = []
        this.input = input
        this.params = params
        this.output = output
    }

    /**
     * @function start
     * @private
     * @desc 執行Process
     */

    start(error, success) {
        this.error = error
        this.success = success
        this.stack.push('input')
        this.input.ng(this.fail).action(...this.params, this.next.bind(this))
    }

    /**
     * @function finish
     * @private
     * @desc 執行output
     */

    finish() {
        this.stack.push('output')
        this.output.ng(this.fail).action(this.success)
    }

    /**
     * @function createError
     * @private
     * @desc 建立錯誤與堆棧
     */

    createError(message) {
        return {
            message: message || 'unknown error',
            stack: this.stack
        }
    }

    /**
     * @function fail
     * @private
     * @desc 呼叫失敗
     */

    fail(message) {
        if (this.stop === false) {
            this.stop = true
            this.error(this.createError(message))
        }
    }

    /**
     * @function next
     * @private
     * @desc 執行下一個flow
     */

    next() {
        if (this.stop === true) { return }
        let flow = this.flow[this.index]
        if (flow) {
            this.stack.push(flow.name)
            flow.method.ng(this.fail).action(...flow.params, () => {
                this.index += 1
                this.next()
            })
        } else {
            this.finish()
        }
    }

}