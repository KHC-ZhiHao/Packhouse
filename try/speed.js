let Packhouse = require('../src/Main')

let factory = Packhouse.createFactory()

factory.addGroup('math', {
    tools: {
        double: {
            action(value) {
                this.success(value * 2)
            }
        }
    }
})

let double = factory.tool('math', 'double').action
let cb = () => {}
let function_double = function(value, cb) {
    cb()
    return value * 2
}

console.time('test')

// for (let i = 0; i < 5000000; i++) {
//     double(10, cb)
// }

for (let i = 0; i < 1000000; i++) {
    function_double(10, cb)
}

console.timeEnd('test')
