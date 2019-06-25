const Base = require('./Base')
const Support = require('./Support')
const Response = require('./Response')

class Store {
    constructor(tool) {
        this._tool = tool
    }

    $coop(name) {
        return this._tool.coop(name)
    }

    $tool(name) {
        return this._tool.useTool(name)
    }

    $line(name) {
        return this._tool.useLine(name)
    }

    $group(name) {
        return this._tool.group.store[name]
    }

    $casting(name, data, callback) {
        return this._tool.casting(name, data, callback)
    }
}

class User {
    constructor(store, error, success) {
        this.$store = store
        this.$error = error
        this.$success = success
    }
}

class Tool extends Base {
    constructor(group, options = {}, store) {
        super('Tool')
        this.group = group
        this.store = store || new Store(this)
        this.options = this.$verify(options, {
            molds: [false, ['array'], []],
            action: [true, ['function']],
            create: [false, ['function'], () => {}]
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

    createExports() {
        let support = new Support()
        let exports = {
            action: this.createLambda('action', support),
            promise: this.createLambda('promise', support),
            recursive: this.createLambda('recursive', support)
        }
        return support.createExports(exports)
    }

    createLambda(func, support) {
        return (...args) => {
            let supports = support.copy()
            let callback = this.getActionCallback(func, args)
            this.bindArgs(args, supports)
            return this[func](args, callback, supports)
        }
    }

    bindArgs(args, supports) {
        let length = args.length
        let packages = supports.package
        let packagesLength = packages.length
        for (let i = length; i--;) {
            args[i] = i >= packagesLength ? args[i - packagesLength] : packages[i]
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

    parseMold(name, params, error, context) {
        let mold = this.group.getMold(name)
        let check = mold.check(params, context)
        if (check === true) {
            return mold.casting(params)
        } else {
            if (typeof error === 'function') {
                error(check)
            } else {
                this.$systemError('parseMold', check)
            }
        }
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

    coop(name) {
        return this.group.getMerger(name)
    }

    call(params, error, success) {
        // mold
        let moldLength = this.molds.length
        for (let i = 0; i < moldLength; i++) {
            let mold = this.molds[i]
            if (mold == null) continue
            params[i] = this.parseMold(mold.name, params[i], error, {
                type: 'call',
                index: i,
                extras: mold.extras
            })
        }
        // action
        this.options.action.apply(new User(this.store, error, success), params)
    }

    action(params, callback, supports) {
        let response = (new Response.Action(this.group, supports, callback)).exports
        this.call(params, response.error, response.success)
    }

    recursive(params, callback, supports, count = -1) {
        count += 1
        let response = (new Response.Recursive(this.group, supports, callback)).exports
        let stack = (...params) => {
            this.recursive(this.createArgs(params, supports), callback, supports, count)
        }
        this.call(params, response.error, result => response.success(result, { count, stack }))
    }

    promise(params, callback, supports) {
        return new Promise((resolve, reject) => {
            let response = (new Response.Promise(this.group, supports, resolve, reject)).exports
            this.call(params, response.error, response.success)
        })
    }

    use() {
        if (this.install) { this.install() }
        return this.createExports()
    }
}

module.exports = Tool
