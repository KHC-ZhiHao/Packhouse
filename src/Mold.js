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

    casting(param, context) {
        return this.options.casting.call(this.case, param, context)
    }

    parse(params, context, callback) {
        let check = this.check(params, context)
        let value = null
        if (check === true) {
            check = null
            value = this.casting(params, context)
        }
        callback(check, value)
    }
}

module.exports = Mold
