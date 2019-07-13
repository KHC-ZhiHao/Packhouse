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

let step = Packhouse.createStep({
    timeout: {
        ms: 2000,
        output: function() {
            console.log('==')
        }
    },
    input() {
        // var a = 5
        // a()
    },
    middle() {
        console.log(1)
        var a = 5
        a()
        console.log(2)
    },
    output() {
        // var a = 5
        // a()
    }
})

// process.on('unhandledRejection', error => {
//     console.log('unhandledRejection', error.message)
// })

// step.run({
//     templates: [
//         async function(next) {
//             console.log('next')
//             next()
//         },
//         async function(next) {
//             console.log('next')
//             next()
//         }
//     ]
// })
// .then(() => { console.log('77') })
// .catch(() => { console.log('88') })

let fn = step.generator({
    options: {},
    templates: [
        async function(next) {
            console.log('next')
            next()
        },
        async function(next) {
            console.log('next')
            next()
        }
    ]
})

fn()

// eslint-disable-next-line no-debugger
// debugger
