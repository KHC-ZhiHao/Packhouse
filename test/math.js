let Packhouse = require('../dist/Packhouse')

let group = Packhouse.createGroup({
    secure: true,
    module: false,
    create() {
        this.testSecure = true
    }
})

group.addMold({
    name: 'max',
    check(param, system) {
        let max = Number(system.extras[0])
        if (param > max) {
            return `Param ${system.index} over ${max}`
        }
        return true
    }
})

group.addTool({
    name: 'required',
    molds: ['required'],
    action(param, system, error, success) {
        success(param)
    }
})

group.addTool({
    name: 'sum',
    keep: 64000,
    molds: [null, 'number'],
    paramLength: 2,
    description: '兩數相加',
    allowDirect: true,
    create: function(store, system) {
        store.testSecure = false
    },
    action: function(a, b, system, error, success) {
        success(a + b)
    }
})

group.addTool({
    name: 'max100',
    keep: 64000,
    molds: ['max|100'],
    allowDirect: true,
    action: function(a, system, error, success) {
        success(a)
    }
})

group.addTool({
    name: 'double',
    molds: ['number|abe'],
    paramLength: 1,
    allowDirect: true,
    create: function(store, { include, group }) {
        this.coefficient = 2
    },
    action: function(number, system, error, success) {
        success((number || 10) * this.coefficient)
    }
})

group.addLine({
    name: 'line',
    inlet: null,
    fail: function(err, report) {
        report(err)
    },
    input: {
        action: function(number, { include }, error, start) {
            this.number = number
            start()
        }
    },
    output: function({ include }, error, success) {
        success(this.number)
    },
    layout: {
        add: {
            action: function(number, { include }, error, next) {
                this.number = include('sum').ng(error).direct(this.number, number)
                next()
            }
        },
        double: function({ include }, error, next) {
            this.number = include('double').ng(error).direct(this.number)
            next()
        }
    }
})

module.exports = group
