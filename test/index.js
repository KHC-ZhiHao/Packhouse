let Packhouse = require('../dist/Packhouse')
let url = 'https://khc-zhihao.github.io/Packhouse/document/document.html'

let factory = Packhouse.createFactory({
    bridge(factory, groupName, toolName) {
        if (factory.hasGroup(groupName) === false) {
            let group = require(`./${groupName}`)
            console.log(group.getProfile())
            if (Packhouse.isGroup(group)) {
                factory.addGroup(groupName, require(`./${groupName}`))
            } else {
                console.log('Not a group', groupName)
            }
        }
    }
})

Packhouse.registerModuleMerger('module', () => {
    return {
        group: require('./module'),
        options: {
            'mode': 'module'
        }
    }
})

factory.tool('math', 'showModuleOptions').action(console.log)

let pump = Packhouse.createPump(3, () => { console.log('pump success') })

try{
    pump.add('5')
} catch(e) {
    console.log('pump error success')
}

try{
    pump.add(-5)
} catch(e) {
    console.log('pump error success')
}

pump.add(2)
pump.each((press, index) => {
    console.log('ouo')
    press()
})

console.log(factory.tool('math', 'double').direct())

factory.tool('math', 'max100').ng(console.log).action(80, console.log)
factory.tool('math', 'max100').ng(console.log).action(200, console.log)

factory.tool('math', 'sum').ng((e) => {throw new Error(e)}).packing(3).recursive(3, (result, context) => {
    if (result >= 12) {
        console.log(`recursive success: ${result}`)
    } else {
        console.log(`recursive index: ${context.count}`)
        context.stack(result, 2)
    }
})

factory.tool('math', 'sum').ng(console.log).sop((context) => {
    if (context.success === false || context.result !== 177) {
        throw new Error('test fail')
    }
    console.log('sop success')
}).action(90, 87, console.log)

factory.tool('math', 'sum').ng(console.log).sop((context) => {
    if (context.success === true) {
        throw new Error('test fail')
    }
}).action(90, '87', console.log)

factory.tool('math', 'required').sop(console.log).direct('87')
factory.tool('math', 'required').ng(console.log).direct(null)

factory.tool('math', 'required').replace({
    molds: [null]
})

factory.tool('math', 'required').ng(e => console.log('replace error')).sop(m => console.log('replace success')).direct(null)

factory.tool('math', 'sum').promise(100, 200).then(console.log).catch(console.log)
factory.tool('math', 'sum').promise(100, '200').then(console.log).catch(console.log)
factory.tool('math', 'sum').ng((e) => { console.log(e)}, { resolve: true }).promise(100, '200')
factory.tool('math', 'sum').ng((e) => { console.log(e)}, { resolve: false }).promise(100, '200').catch(m => console.log('reject'))
factory.tool('math', 'double').ng(console.log).action(90, console.log)

factory.tool('math', 'sum')
    .sop((c) => { console.log(c)})
    .promise(100, 200)
    .then(console.log)

console.log(factory.tool('math', 'sum').ng(console.log).direct(600, '800'))
console.log(factory.tool('math', 'sum').direct(600, 600))

console.log(factory.tool('math', 'sum').sop((context) => {
    if (context.result !== 1200) {
        throw new Error('rePacking error')
    }
}).packing(600).rePacking(500).direct(700))

factory.tool('math', 'sum').ng(console.log).sop(console.log).packing(90).action(87, console.log)

factory.tool('math', 'sum').rule(console.log, console.log).packing(90).action(87, console.log)

factory
    .tool('math', 'sum')
    .packing(10, 10)
    .rule(console.log, (context) => {
        console.log('AAAA', context.result)
        if (context.success === false || context.result !== 160) {
            throw new Error('test fail')
        }
    })
    .weld('double', (result, packing) => packing(result))
    .weld('double', (result, packing) => packing(result))
    .weld('double', (result, packing) => packing(result))
    .action(console.log)

factory.line('math', 'line')(5).add(10).action(console.log)

factory.line('math', 'line')('5').setRule(
    (e) => {console.log('line error', e.message)},
    (c) => {console.log('line sop')}
).double().promise().then(console.log).catch(e => console.log('e', e))

factory.line('math', 'lineLazy')(5).add(10).action(console.log)

factory.line('math', 'lineLazy')('5').setRule(console.log).double().promise().then(console.log).catch(console.log)

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

console.log(factory.hasGroup('math'))
factory.removeGroup('math')
console.log(factory.hasGroup('math'))
