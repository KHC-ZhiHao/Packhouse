class Response {

    constructor(supports) {
        this.over = false
        this.sop = supports.sop
        this.noGood = supports.noGood
    }

    getError(message) {
        return message || 'unknown error'
    }

    exports() {
        return {
            error: m => this.error(m),
            success: m => this.success(m)
        }
    }

    error(result) {
        if (this.over === false) {
            this.over = true
            this.errorBase(result)
            this.callSop({ success: false, result: result })
        }
    }

    success(result) {
        if (this.over === false) {
            this.over = true
            this.successBase(result)
            this.callSop({ success: true, result: result })
        }
    }

    callSop(context) {
        if (this.sop) {
            this.sop(context)
        }
    }

}

class ResponseDirect extends Response {

    constructor(supports) {
        super(supports)
        this.result = null
    }

    errorBase(result) {
        if (this.noGood) {
            this.noGood(this.getError(result))
        } else {
            throw new Error(this.getError(result))
        }
    }

    successBase(result) {
        this.result = result
    }

}

class ResponseAction extends Response {

    constructor(supports, callback) {
        super(supports)
        this.callback = callback || function () {}
    }

    errorBase(result) {
        let message = this.getError(result)
        if (this.noGood) {
            this.noGood(message)
        } else {
            this.callback(message, null)
        }
    }

    successBase(result) {
        if (this.noGood) {
            this.callback(result)
        } else {
            this.callback(null, result)
        }
    }

}

class ResponsePromise extends Response {

    constructor(supports, resolve, reject) {
        super(supports)
        this.resolve = resolve
        this.reject = reject
    }

    errorBase(result) {
        let message = this.getError(result)
        if (this.noGood) {
            this.noGood(message)
        }
        this.reject(message)
    }

    successBase(result) {
        this.resolve(result)
    }

}