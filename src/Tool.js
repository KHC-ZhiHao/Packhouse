const Base = require('./Base')
const Utils = require('./Utils')
const Lambda = require('./Lambda')
const Response = require('./Response')
const ToolHandler = require('./ToolHandler')

function mergerParse(name) {
    let match = name.match('/')
    if (match) {
        return {
            name: name.slice(match.index + 1),
            group: name.slice(0, match.index)
        }
    }
    return null
}

class Includes {
    constructor(tool, name) {
        this._tool = tool
        this._name = name
    }

    _coop(merger) {
        let coop = this._tool.group.callCoop(merger)
        return {
            tool: (name) => {
                this._tool.used[this._name] = coop.tool(name)
            },
            line: (name) => {
                this._tool.used[this._name] = coop.line(name)
            }
        }
    }

    tool(name, ...packs) {
        let merger = mergerParse(name)
        if (merger) {
            this._coop(merger.group).tool(merger.name)
        } else {
            this._tool.used[this._name] = this._tool.group.callTool(name)
        }
        for (let pack of packs) {
            this._tool.used[this._name].pack(pack)
        }
    }

    line(name, ...packs) {
        let merger = mergerParse(name)
        if (merger) {
            this._coop(merger.group).line(merger.name)
        } else {
            this._tool.used[this._name] = this._tool.group.callLine(name)
        }
        this._tool.packs[this._name] = packs
    }
}

class System {
    constructor(tool) {
        this._tool = tool
        this.include = name => this._tool.include(name)
    }

    get packhouse() {
        return this._tool.group.packhouse.main
    }

    get group() {
        return this._tool.group.store
    }

    get utils() {
        return Utils
    }

    get store() {
        return this._tool.store
    }
}

class Tool extends Base {
    constructor(group, options, name, reference = {}) {
        super('Tool')
        this.name = name || 'no name tool'
        this.used = reference.used || {}
        this.packs = reference.packs || {}
        this.store = reference.store || {}
        this.group = group
        this.packhouse = group.packhouse
        this.options = Utils.verify(options, {
            info: [false, ['string'], null],
            request: [false, ['array'], () => []],
            handler: [true, ['function']],
            install: [false, ['function'], () => () => {}],
            response: [false, ['string'], null]
        })
        this.requestJSON = JSON.stringify(this.options.request)
    }

    install() {
        this.install = null
        this.options.install(new System(this))
    }

    include(name) {
        return new Includes(this, name)
    }

    emit(channel, data) {
        this.group.packhouse.event.emit(channel, data)
    }

    call({ parameters, used, mode, context, response }) {
        // event
        this.emit('run', Object.assign({
            detail: {
                name: this.name,
                args: parameters.slice(0),
                mode,
                info: this.options.info,
                request: this.requestJSON,
                response: this.options.response,
                group: {
                    name: this.group.name,
                    sign: this.group.sign
                }
            }
        }, context))
        // request
        let handler = new ToolHandler(this, used, context, response)
        let length = this.options.request.length
        for (let i = 0; i < length; i++) {
            let mold = this.options.request[i]
            if (mold == null) {
                continue
            }
            try {
                parameters[i] = this.parseMold(mold, parameters[i], i)
            } catch (error) {
                return handler.error({
                    name: mold,
                    type: 'mold',
                    mode: 'request',
                    error
                })
            }
        }
        // action
        if (response.isLive()) {
            parameters.unshift(handler)
            this.options.handler.apply(handler, parameters)
        }
    }

    action({ args, used, context, configs }) {
        let callback = args.pop()
        let response = new Response.Action(this, configs, context, callback)
        let parameters = this.parserArgs(args, configs)
        this.call({
            used,
            mode: 'action',
            context,
            response,
            parameters
        })
    }

    promise({ args, used, context, configs }) {
        return new Promise((resolve, reject) => {
            let response = new Response.Promise(this, configs, context, resolve, reject)
            let parameters = this.parserArgs(args, configs)
            this.call({
                used,
                mode: 'promise',
                context,
                response,
                parameters
            })
        })
    }

    parserArgs(target, configs) {
        let args = new Array(target.length)
        let packLength = configs.packages.length
        let argsLength = configs.packages.length + target.length
        for (let i = 0; i < argsLength; i++) {
            args[i] = i >= packLength ? target[i - packLength] : configs.packages[i]
        }
        return args
    }

    parseMold(name, value, index) {
        return this.group.parseMold(name, value, index)
    }

    use() {
        if (this.install) {
            this.install()
        }
        return new Lambda(this)
    }
}

module.exports = Tool
