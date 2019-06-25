const Base = require('./Base')

class Support extends Base {
    constructor() {
        super('Support')
        this.sop = null
        this.welds = []
        this.noGood = null
        this.package = []
        this.exports = null
    }

    createExports(lambdas) {
        this.exports = {
            ...lambdas,
            ng: this.setNoGood.bind(this),
            unNg: this.unNoGood.bind(this),
            sop: this.setSop.bind(this),
            rule: this.setRule.bind(this),
            unSop: this.unSop.bind(this),
            weld: this.addWeld.bind(this),
            clear: this.clear.bind(this),
            unWeld: this.unWeld.bind(this),
            packing: this.addPacking.bind(this),
            rePacking: this.rePacking.bind(this),
            unPacking: this.unPacking.bind(this)
        }
        return this.exports
    }

    copy() {
        return {
            sop: this.sop,
            welds: this.welds.slice(),
            noGood: this.noGood,
            package: this.package.slice()
        }
    }

    addWeld(tool, packing) {
        this.welds.push({ tool, packing })
        return this.exports
    }

    unWeld() {
        this.welds = []
        return this.exports
    }

    setRule(noGood, sop, options) {
        if (noGood) {
            this.setNoGood(noGood, options)
        }
        if (sop) {
            this.setSop(sop)
        }
        return this.exports
    }

    setNoGood(action, options = {}) {
        if (typeof action === 'function') {
            this.noGood = {
                action: action,
                options: this.$verify(options, {
                    resolve: [false, ['boolean'], false]
                })
            }
            return this.exports
        }
        this.$systemError('setNG', 'NG param not a function.', action)
    }

    unNoGood() {
        this.noGood = null
        return this.exports
    }

    setSop(action) {
        if (typeof action === 'function') {
            this.sop = action
            return this.exports
        }
        this.$systemError('setSOP', 'SOP param not a function.', action)
    }

    unSop() {
        this.sop = null
        return this.exports
    }

    addPacking() {
        this.package = this.package.concat([...arguments])
        return this.exports
    }

    rePacking() {
        this.package = [...arguments]
        return this.exports
    }

    unPacking() {
        this.package = []
        return this.exports
    }

    clear() {
        this.unNoGood()
        this.unSop()
        this.unWeld()
        this.unPacking()
        return this.exports
    }
}

module.exports = Support
