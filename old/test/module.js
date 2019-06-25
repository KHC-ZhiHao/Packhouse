let Packhouse = require('../dist/Packhouse')
let group = Packhouse.createGroup({
    secure: true,
    module: true,
    merger: {
        mod: 'module',
    },
    create(options) {
        this.options = options
    }
})

group.addTool({
    name: 'getOptions',
    action(param, system, error, success) {
        success(system.group.options)
    }
})

module.exports = group
