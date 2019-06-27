let Packhouse = require('../../src/Main')
let group = require('../fake/group')

let factory = Packhouse.createFactory()

factory.setConfigs({ test: 'test' })
factory.addGroup('math', group)

// eslint-disable-next-line no-debugger
debugger
