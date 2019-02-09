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
        this.group = group;
        this.data = this.$verify(options, {
            name: [true, ''],
            fail: [true, '#function'],
            inlet: [false, []],
            input: [true, '#function'],
            output: [true, '#function'],
            layout: [true, {}]
        })
        this.inlet = this.data.inlet || null
        this.tools = {}
        this.checkPrivateKey()
    }

    get name() { return this.data.name }

    /**
     * @function checkPrivateKey
     * @private
     * @desc action, promise是不允許被放在layout的
     */

    checkPrivateKey() {
        let layout = this.data.layout
        if( layout.action || layout.promise ){
            this.$systemError('init', 'Layout has private key(action, promise)')
        }
    }

    /**
     * @function use
     * @private
     * @desc Line的對外接口
     */

    use() {
        let self = this
        return function() {
            let unit = new Deploy(self, [...arguments])
            return unit.getConveyer()
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
        this.init()
    }

    /**
     * @function createTool
     * @private
     * @desc 實例化layout
     */

    createTool(name, action) {
        return (new Tool({ name, action }, this.main.group, this.case)).use()
    }

    /**
     * @function init
     * @private
     * @desc 初始化I/O
     */

    init() {
        this.input = this.createTool('input', this.main.data.input)
        this.output = this.createTool('output', this.main.data.output)
        this.initConveyer()
    }

    /**
     * @function initConveyer
     * @private
     * @desc 初始化輸送帶
     */

    initConveyer() {
        let self = this;
        this.conveyer = {
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }
        for (let name in this.layout) {
            this.conveyer[name] = function() {
                self.register(name, [...arguments])
                return self.getConveyer()
            }
        }
    }

    /**
     * @function getConveyer
     * @private
     * @desc 輸送帶的對外接口
     */

    getConveyer() {
        return this.conveyer
    }

    /**
     * @function register
     * @private
     * @desc 註冊一個flow
     */

    register(name, params) {
        if (this.main.inlet.length !== 0 && this.flow.length === 0) {
            if (!this.main.inlet.includes(name)) {
                this.$systemError('register', 'First call method not inside inlet.', name)
            }
        }
        let data = {
            name: name,
            method: this.createTool(name, this.layout[name]),
            params: params
        }
        this.flow.push(data)
    }

    /**
     * @function action
     * @private
     * @desc 執行有回乎函數的動作
     */

    action(callback) {
        let error = (error) => {
            this.main.data.fail(error, (report) => {
                callback(report, null)
            })
        }
        let success = (success) => {
            callback(null, success)
        }
        this.process(error, success)
    }

    /**
     * @function action
     * @private
     * @desc 執行回傳Promise的動作
     */

    promise() {
        return new Promise(( resolve, reject )=>{
            this.action((err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }

    /**
     * @function process
     * @private
     * @desc process是一個包裝執行過程的物件
     */

    process(error, success) {
        let rightNow = new Process(this.params, this.flow, this.input, this.output)
        rightNow.start(error, success)
    }

}

/**
 * @class Process
 * @desc process是一個包裝執行過程的物件
 */

class Process extends ModuleBase {

    constructor(params, flow, input, output) {
        super('Process')
        this.params = params
        this.stop = false
        this.flow = flow
        this.index = 0
        this.stack = []
        this.input = input
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
        this.input.action(...this.params, (err) => {
            if (err) {
                this.fail(err)
            } else {
                this.next()
            }
        })
    }

    /**
     * @function finish
     * @private
     * @desc 執行output
     */

    finish() {
        this.stack.push('output')
        this.output.action((err, result) => {
            if (err) {
                this.fail(err)
            } else {
                this.success(result)
            }
        })
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
        let flow = this.flow[this.index]
        if (flow && this.stop === false) {
            this.stack.push(flow.name)
            flow.method.action(...flow.params, (err) => {
                if (err) {
                    this.fail(err)
                } else {
                    this.index += 1
                    this.next()
                }
            })
        } else if (this.stop === false) {
            this.finish()
        }
    }

}