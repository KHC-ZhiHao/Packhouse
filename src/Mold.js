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

    check(param, system) {
        return this.options.check.call(this.case, param, system)
    }

    casting(param) {
        return this.options.casting.call(this.case, param)
    }
}

module.exports = Mold
