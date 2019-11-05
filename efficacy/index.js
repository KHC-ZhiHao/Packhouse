const Step = require('../plugins/Step')
const Packhouse = require('../src/Packhouse')

const packhouse = new Packhouse()
const group = {
    tools: {
        sum: {
            request: ['number', 'number'],
            response: 'number',
            handler(self, a, b) {
                self.success(a + b)
            }
        },
        double: {
            request: ['number'],
            response: 'number',
            install({ include }) {
                include('sum').tool('sum')
            },
            handler(self, a) {
                self.tool('sum')
                    .noGood(self.error)
                    .action(a, a, self.success)
            }
        }
    }
}

packhouse.plugin(Step)
packhouse.addGroup('math', () => ({ data: group }))

// const template = []

// template[0] = (self, done) => {
//     self.foo = 0
//     packhouse.tool('math', 'sum').action(10, 10, (err, result) => {
//         self.foo = result
//         done()
//     })
// }

// for (let i = 0; i < 100000; i++ ) {
//     template[i + 1] = (self, done) => {
//         packhouse.tool('math', 'double').action(self.foo, (err, result) => {
//             self.foo = result
//             done()
//         })
//     }
// }

// packhouse.step({
//     template,
//     output(self, context, success) {
//         context.history.toJSON()
//         console.timeEnd('main')
//         success()
//     }
// })

function sum(a, b) {
    return a + b
}

console.time('org')
sum(10, 10)
console.timeEnd('org')

console.time('main')
packhouse.tool('math', 'sum').action(10, 10, () => {
    console.timeEnd('main')
})
