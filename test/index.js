let Packhouse = require('../dist/index')
let factory = new Packhouse()

factory.setBridge((factory, groupName, toolName) => {
	if (factory.hasGroup(groupName) === false) {
        factory.addGroup(groupName, require(`./${groupName}`))
    }
})

factory.tool('math', 'sum').ng((err) => {
    console.log(err)
}).action(90, 80, (result) => {
    console.log(result)
})

factory.tool('math', 'double').ng((err) => {
    console.log(err)
}).action(90, (result) => {
    console.log(result)
})