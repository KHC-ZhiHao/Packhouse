let Packhouse = require('../../src/Main')
let group = require('../fake/group')
let merger = require('../fake/merger')

let factory = Packhouse.createFactory()
factory.on('error', (context) => {
    console.log('error :')
    console.log(context)
})
factory.addGroup('math', group)
factory.merger('merger', merger, { test: 'test' })
// eslint-disable-next-line no-debugger
debugger
