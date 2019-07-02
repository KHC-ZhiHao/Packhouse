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

class User {
    constructor(tool, response, context) {
        this.store = tool.store
        this.context = context
        this.error = (reslut) => {
            this.context.finishTime = Date.now()
            tool.emit('error', { reslut, context: this.context })
            response.error(reslut)
        }
        this.success = (reslut) => {
            this.context.success = true
            this.context.finishTime = Date.now()
            tool.emit('success', { reslut, context: this.context })
            response.success(reslut)
        }
    }
}

class Tool extends Base {
    constructor(group, options = {}, context = {}) {
        super('Tool')
        this.name = context.name || 'no_name_tool'
        this.group = group
        this.store = context.store || new Store(this)
        this.profile = new Profile(this, 'tool')
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

    exports(context) {
        let support = new Support()
        let exports = {
            action: this.createLambda('action', support, context),
            promise: this.createLambda('promise', support, context),
            recursive: this.createLambda('recursive', support, context)
        }
        return support.createExports(exports)
    }

    createLambda(mode, support, caller) {
        return (...args) => {
            let context = this.createContext(mode, support, caller)
            let supports = support.copy()
            let callback = this.getActionCallback(mode, args)
            let params = Helper.createArgs(args, supports)
            return this[mode](params, supports, context, callback)
        }
    }

    createContext(mode, args, caller) {
        return {
            mode,
            args,
            caller,
            success: false,
            startTime: Date.now(),
            finishTime: null
        }
    }

    getActionCallback(mode, args) {
        if (mode === 'action' || mode === 'recursive') {
            let callback = args.pop()
            if (typeof callback !== 'function') {
                this.$systemError('getActionCallback', 'Action or recursive must a callback.')
            }
            return callback
        }
        return null
    }

    call(params, context, response) {
        this.emit('action-tool-before', context)
        // mold
        let user = new User(this, response, context)
        let moldLength = this.molds.length
        for (let i = 0; i < moldLength; i++) {
            let mold = this.molds[i]
            if (mold == null) continue
            params[i] = this.parseMold(mold.name, params[i], user, {
                index: i,
                extras: mold.extras
            })
        }
        // action
        if (response.isLive()) {
            this.options.action.apply(user, params)
        }
    }

    action(params, supports, context, callback) {
        let response = new Response.Action(this.group, supports, callback)
        this.call(params, context, response)
    }

    recursive(params, supports, context, callback) {
        let response = new Response.Recursive(this, this.group, supports, context, callback)
        this.call(params, context, response)
    }

    promise(params, supports, context) {
        return new Promise((resolve, reject) => {
            let response = new Response.Promise(this.group, supports, resolve, reject)
            this.call(params, context, response)
        })
    }

    parseMold(name, value, user, context) {
        return this.group.getMold(name).parse(value, user, context)
    }

    casting(name, value, error) {
        let data = name.split('|')
        let call = data.shift()
        let type = 'system'
        let index = 0
        let extras = data
        return this.parseMold(call, value, { error }, { type, index, extras })
    }

    useTool(name) {
        return this.group.callTool(name, this.profile.export())
    }

    useLine(name) {
        return this.group.callLine(name, this.profile.export())
    }

    useCoop(name) {
        return this.group.callCoop(name, this.profile.export())
    }

    use(context) {
        if (this.install) { this.install() }
        return this.exports(context)
    }
}

module.exports = Tool
