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

    addWeld(tool, pack) {
        this.welds.push({ tool, pack })
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

    pack(args) {
        this.package = this.package.concat(args)
    }

    rePack(args) {
        this.package = args
    }

    unPack() {
        this.package = []
    }

    clear() {
        this.unNoGood()
        this.unSop()
        this.unWeld()
        this.unPack()
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

    weld(tool, pack) {
        this._core.addWeld(tool, pack)
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

    pack(...args) {
        this._core.pack(args)
        return this
    }

    rePack(...args) {
        this._core.rePack(args)
        return this
    }

    unPack() {
        this._core.unPack()
        return this
    }
}

module.exports = Support
