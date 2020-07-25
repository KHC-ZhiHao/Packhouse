const Base = require('./Base')
const Utils = require('./Utils')

class Handler extends Base {
    constructor(tool, used, context, response) {
        super('Handler')
        this._used = used
        this._tool = tool
        this.utils = Utils
        this.context = context
        this.success = reslut => response.success(reslut)
        this.error = reslut => {
            if (this._tool.packhouse.interceptError == null) {
                response.error(reslut)
            } else {
                response.error(this._tool.packhouse.interceptError(reslut))
            }
        }
        this.assess = compile => (error, result) => {
            if (error) {
                this.error(error)
            } else {
                if (compile) {
                    this.success(compile(result))
                } else {
                    this.success(result)
                }
            }
        }
    }

    get store() {
        return this._tool.store
    }

    _getUsed(name) {
        let used = this._used[name]
        if (used) {
            return used
        } else {
            this.$devError('include', `Include name(${name}) not found`)
        }
    }

    line(name) {
        let output = this._getUsed(name)
        if (typeof output !== 'function') {
            this.$devError('line', 'Source not a line.')
        }
        return output
    }

    tool(name) {
        let output = this._getUsed(name)
        if (typeof output === 'function') {
            this.$devError('tool', 'Source not a tool.')
        }
        return output
    }

    casting(name, target) {
        return this._tool.parseMold(name, target, 0)
    }
}

module.exports = Handler
