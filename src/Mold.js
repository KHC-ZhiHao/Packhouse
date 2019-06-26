const Base = require('./Base')

class MoldStore {}
class Mold extends Base {
    constructor(options = {}) {
        super('Mold')
        this.case = new MoldStore()
        this.options = this.$verify(options, {
            check: [false, ['function'], function() { return true }],
            casting: [false, ['function'], function(param) { return param }]
        })
    }

    check(param, context) {
        return this.options.check.call(this.case, param, context)
    }

    casting(param) {
        return this.options.casting.call(this.case, param)
    }

    parse(params, error, context) {
        let check = this.check(params, context)
        if (check === true) {
            return this.casting(params)
        } else {
            if (typeof error === 'function') {
                error(check)
            } else {
                this.$systemError('parse', check)
            }
        }
    }
}

module.exports = Mold
