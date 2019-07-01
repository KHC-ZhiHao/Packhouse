const Base = require('./Base')
const Helper = require('./Helper')
const Profile = require('./Profile')
const Support = require('./Support')
const Response = require('./Response')

class Store {
    constructor(tool) {
        this._tool = tool
        this.$group = tool.group.store
    }

    $coop(name) {
        return this._tool.useCoop(name)
    }

    $tool(name) {
        return this._tool.useTool(name)
    }

    $line(name) {
        return this._tool.useLine(name)
    }

    $casting(name, data, callback) {
        return this._tool.casting(name, data, callback)
    }
}

class Caller {
    constructor(store, { exports }) {
        this.store = store
        this.error = exports.error
        this.success = exports.success
    }
}

class Tool extends Base {
    constructor(group, options = {}, context = {}) {
        super('Tool')
        this.name = context.name || 'no_name_tool'
        this.group = group
        this.store = context.store || new Store(this)
        this.options = this.$verify(options, {
            molds: [false, ['array'], []],
            action: [true, ['function']],
            create: [false, ['function'], () => {}]
        })
    }

    emit(name, options) {
        this.group.emit(name, {
            type: 'tool',
            from: this.name,
            ...options
        })
    }

    install() {
        this.initMolds()
        this.options.create(this.store)
        this.install = null
    }

    initMolds() {
        let length = this.options.molds.length
        this.molds = new Array(length)
        for (let i = 0; i < length; i++) {
            let mold = this.options.molds[i]
            if (mold) {
                let data = this.options.molds[i].split('|')
                let name = data.shift()
                this.molds[i] = { name, extras: data }
            } else {
                this.molds[i] = null
            }
        }
    }

    exports() {
        let support = new Support()
        let exports = {
            action: this.createLambda('action', support),
            promise: this.createLambda('promise', support),
            recursive: this.createLambda('recursive', support)
        }
        return support.createExports(exports)
    }

    createLambda(type, support) {
        return (...args) => {
            let supports = support.copy()
            let callback = this.getActionCallback(func, args)
            let params = Helper.createArgs(args, supports)
            this[type](params, supports, callback)
        }
    }

    getActionCallback(type, args) {
        if (type === 'action' || type === 'recursive') {
            let callback = args.pop()
            if (typeof callback !== 'function') {
                this.$systemError('getActionCallback', 'Action or recursive must a callback.')
            }
            return callback
        }
        return null
    }

    parseMold(name, value, error, context) {
        return this.group.getMold(name).parse(value, error, context)
    }

    casting(name, value, callback) {
        let data = name.split('|')
        let call = data.shift()
        let type = 'system'
        let index = 0
        let extras = data
        return this.parseMold(call, value, callback, { type, index, extras })
    }

    useTool(name) {
        return this.group.callTool(name)
    }

    useLine(name) {
        return this.group.callLine(name)
    }

    useCoop(name) {
        return this.group.callCoop(name)
    }

    call(params, response) {
        this.emit('action-tool-before', { args: params })
        // mold
        let moldLength = this.molds.length
        for (let i = 0; i < moldLength; i++) {
            let mold = this.molds[i]
            if (mold == null) continue
            params[i] = this.parseMold(mold.name, params[i], response.exports.error, {
                index: i,
                extras: mold.extras
            })
        }
        // action
        if (response.isLive()) {
            this.options.action.apply(new Caller(this.store, response), params)
        }
    }

    action(params, supports, callback) {
        let response = new Response.Action(this.group, supports, callback)
        this.call(params, response)
    }

    recursive(params, supports, callback) {
        let response = new Response.Recursive(this, this.group, supports, callback)
        this.call(params, response)
    }

    promise(params, supports) {
        return new Promise((resolve, reject) => {
            let response = new Response.Promise(this.group, supports, resolve, reject)
            this.call(params, response)
        })
    }

    use() {
        if (this.install) { this.install() }
        return this.exports()
    }
}

module.exports = Tool
