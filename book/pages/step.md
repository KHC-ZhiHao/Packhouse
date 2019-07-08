# Step

Step是一個Pipeline實現，在MVC模式中可以歸類在Controller的部分。

```js
const step = Packhouse.createStep({
    // 超過愈期時間會強行宣告fail('timeout')
    timeout: 20000,
    // 在mixin重組template並回傳
    mixin(templates, options) {
        return templates
    },
    // 當參數進來時宣告
    input(args, options, { exit, fail }) {
        this.count = args[0] + options.start
    },
    // 每一個template之間宣告
    middle({ exit, fail }) {
        this.count += 1
    },
    // template運算結束或宣告exit or fail
    output({ success, message }) {
        // output return 的值就是step的最終結果
        return this.count
    }
})
```

## Flow

Exit與Fail都是中斷整個流程，差別在於Output這個方法收到的Success是否為true(fail為false)。

## Run

執行step會回傳一個promise：

```js
step.run({
    args: [5],
    options: {
        start: 5
    },
    templates: [
        async function temp(next, {exit, fail}) {
            next()
        },
        async function temp(next, {exit, fail}) {
            next()
        }
    ]
}).then(console.log) // 12
```

## Generator

Run的Args怎麼這麼雞肋？

沒錯，這參數是給Generator用的，呼叫Generator後會產生一組獨立的async function。

```js
let newStep = step.generator({
    options: {
        start: 5
    },
    templates: [
        async function temp(next, {exit, fail}) {
            next()
        },
        async function temp(next, {exit, fail}) {
            next()
        }
    ]
})
newStep(5).then(console.log) // 12
```

## Export

Export是一個綁定Generator的方法

```js
module.exports = step.export()
```

可以在AWS Lambda這樣宣告：

```js
const step = require('./step')
exports.handler = step({
    options: {
        start: 0
    },
    templates: [
        async function(next) {
            next()
        }
    ]
})
```