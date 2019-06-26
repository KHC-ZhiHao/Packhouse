const Base = require('./Base')
const Helper = require('./Helper')

class Support extends Base {
    constructor() {
        super('Support')
        this.sop = null
        this.welds = []
        this.noGood = null
        this.package = []
    }

    createExports(lambdas) {
        return new SupportExport(this, lambdas)
    }

    copy() {
        return {
            sop: this.sop,
            welds: Helper.arrayCopy(this.welds),
            noGood: this.noGood,
            package: Helper.arrayCopy(this.package)
        }
    }

    addWeld(tool, packing) {
        this.welds.push({ tool, packing })
    }

    unWeld() {
        this.welds = []
    }

    setRule(noGood, sop, options) {
        if (noGood) {
            this.setNoGood(noGood, options)
        }
        if (sop) {
            this.setSop(sop)
        }
    }

    setNoGood(action, options = {}) {
        if (typeof action === 'function') {
            this.noGood = {
                action: action,
                options: this.$verify(options, {
                    resolve: [false, ['boolean'], false]
                })
            }
        } else {
            this.$systemError('setNG', 'NG param not a function.', action)
        }
    }

    unNoGood() {
        this.noGood = null
    }

    setSop(action) {
        if (typeof action === 'function') {
            this.sop = action
        } else {
            this.$systemError('setSOP', 'SOP param not a function.', action)
        }
    }

    unSop() {
        this.sop = null
    }

    addPacking(args) {
        this.package = this.package.concat(args)
    }

    rePacking(args) {
        this.package = args
    }

    unPacking() {
        this.package = []
    }

    clear() {
        this.unNoGood()
        this.unSop()
        this.unWeld()
        this.unPacking()
    }
}

class SupportExport {
    constructor(core, lambdas) {
        this._core = core
        this.action = lambdas.action
        this.promise = lambdas.promise
        this.recursive = lambdas.recursive
    }

    ng(action, options) {
        this._core.setNoGood(action, options)
        return this
    }

    unNg() {
        this._core.unNoGood()
        return this
    }

    sop(action) {
        this._core.setSop(action)
        return this
    }

    unSop() {
        this._core.unSop()
        return this
    }

    rule(noGood, sop, options) {
        this._core.setRule(noGood, sop, options)
        return this
    }

    weld(tool, packing) {
        this._core.addWeld(tool, packing)
        return this
    }

    clear() {
        this._core.clear()
        return this
    }

    unWeld() {
        this._core.unWeld()
        return this
    }

    packing(...args) {
        this._core.addPacking(args)
        return this
    }

    rePacking(...args) {
        this._core.rePacking(args)
        return this
    }

    unPacking() {
        this._core.unPacking()
        return this
    }
}

module.exports = Support
