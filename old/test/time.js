let Packhouse = require('./core')

let group = Packhouse.createGroup()

group.addTool({
    name: 'double',
    action(number, system, error, success) {
        success(number * 2)
    }
})

let action = group.alone().tool('double').direct

function double(number) {
    return number * 2
}

console.time('normal')
for (let i = 0; i < 5000000; i++) {
    double(10)
}
console.timeEnd('normal')

console.time('ph')
for (let i = 0; i < 5000000; i++) {
    action(10)
}
console.timeEnd('ph')
