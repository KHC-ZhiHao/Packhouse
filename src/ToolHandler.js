class Handler {
    constructor(tool, used, context, response) {
        this._used = used
        this._tool = tool
        this.context = context
        this.error = reslut => response.error(reslut)
        this.success = reslut => response.success(reslut)
    }

    get store() {
        return this._tool.store
    }

    use(name) {
        return this._used[name]
    }

    casting(name, target) {
        return this._tool.parseMold(name, target, 0)
    }
}

module.exports = Handler
