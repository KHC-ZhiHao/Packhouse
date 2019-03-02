let Packhouse = require('../dist/index')
let factory = new Packhouse()
let url = 'https://khc-zhihao.github.io/Packhouse/document/document.html'

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

factory.tool('request', 'get').ng((err) => {
    console.log('error => ', err)
}).action(url, (result) => {
    console.log('success => ', result.slice(0, 10) + '...')
})

factory.tool('request', 'get').ng((err) => {
    console.log('error => ', err)
}).action(url, (result) => {
    console.log('success => ', result.slice(0, 10) + '...')
})

setTimeout(() => {
    factory.tool('request', 'get').ng((err) => {
        console.log('error => ', err)
    }).action(url, (result) => {
        console.log('success => ', result.slice(0, 10) + '...')
    })
}, 3000)

setTimeout(() => {
    factory.tool('request', 'get').ng((err) => {
        console.log('error => ', err)
    }).action(url, (result) => {
        console.log('success => ', result.slice(0, 10) + '...')
    })
}, 5000)
