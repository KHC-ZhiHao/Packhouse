let Packhouse = require('../dist/Packhouse')
let Test = Packhouse.createFactory({
    bridge(factory, groupName, toolName) {
        if (factory.hasGroup(groupName) === false) {
            factory.addGroup(groupName, require(`./${groupName}`))
        }
    }
})

/**
 * @desc 測試樣板
 */

Test.tool('math', 'max100')
    .ng(console.log)
    .sop()
    .action(80, console.log)