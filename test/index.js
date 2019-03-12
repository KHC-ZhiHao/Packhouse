let Packhouse = require('../dist/Packhouse')
let factory = Packhouse.createFactory()
let url = 'https://khc-zhihao.github.io/Packhouse/document/document.html'

factory.setBridge((factory, groupName, toolName) => {
	if (factory.hasGroup(groupName) === false) {
        let group = require(`./${groupName}`)
        if (Packhouse.isGroup(group)) {
            factory.addGroup(groupName, require(`./${groupName}`))
        } else {
            console.log('Not a group', groupName)
        }
    }
})


factory.tool('math', 'sum').ng((err) => {
    console.log(err)
}).sop(c => console.log(c)).action(90, 87, (result) => {
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

factory.tool('request', 'update').direct()

factory.tool('request', 'get').ng((err) => {
    console.log('error => ', err)
}).sop(c => console.log(c)).unSop().action(url, (result) => {
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
