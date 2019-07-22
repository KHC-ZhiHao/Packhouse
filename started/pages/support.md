# 預處裡

如果只是單純呼叫一個函數，會不會太弱了點？

是，太弱惹...所以必須給他們武器。

先來一組Group吧：

```js
factory.join('math', {
    tools: {
        sum: {
            action(a, b) {
                this.success(a + b)
            }
        }
        multiply: {
            action(a, b) {
                this.success(a * b)
            }
        }
    }
})
```

## Pack

通過Pack可以預設參數，進而產生新的Function。

```js
let double = factory.tool('math', 'multiply').pack(2).action
double(5, (err, result) => {
    console.log(result) // 10
})
```

Pack可以不斷宣告下去：

```js
let get20 = factory.tool('math', 'multiply').pack(2).pack(10).action
get20((err, result) => {
    onsole.log(result) // 20
})
```

也可以直接宣告多個參數：

```js
let get20 = factory.tool('math', 'multiply').pack(2, 10).action
get20((err, result) => {
    onsole.log(result) // 20
})
```

使用rePack可以抹掉先前的紀錄，重新配置參數：

```js
let get20 = factory.tool('math', 'multiply').pack(5).rePack(2, 10).action
get20((err, result) => {
    onsole.log(result) // 20
})
```

## Ng

攔截錯誤資訊，但不是採用監聽模式，反覆宣告會取代前一個宣告的方法。

```js
factory.join('validate', {
    tools: {
        isNumber: {
            action(value) {
                if (typeof value === 'number') {
                    this.success(true)
                } else {
                    this.error('Value not a number.')
                }
            }
        }
    }
})
factory.tool('validate', 'isNumber').ng((e) => { console.log(e) }).action('string', () => {}) // Value not a number.
```

### Action & Recursive

在Action與Recursive的呼叫方法下，callback第一個error參數會被移除。

```js
factory.tool('validate', 'isNumber').ng(errorCallback).action(10, (result) => {
    console.log(result) // true
})
```

### Promise

在Promise的呼叫方法下，仍會宣告reject且呼叫callback，你可以賦予第二個參數要求錯誤也執行resolve。

```js
factory.tool('validate', 'isNumber').ng(errorCallback, {
    resolve: true
}).promise('10').then((result) => {
    console.log(result) // undefined
})
```

## SOP

不論錯誤或成功都會執行sop，可以處理一些共通邏輯。

> Recursive只要呼叫一次就會宣告一次SOP。

```js
factory.tool('validate', 'isNumber').sop((context) => {
    console.log(context.success) // false
    console.log(context.result) // Value not a number.
}).promise('string')
```

## Rule

NG和SOP的統一處理介面，有時候可以讓程式碼美觀一點。

```js
factory.tool('validate', 'isNumber').rule(ngCallback, sopCallbakc, ngOptions).promise('string')
```

## Clear

移除所有預乘載。

> 每個單元都有自己的移除方法，詳情請參閱API Document。

```js
factory.tool('math', 'multiply').pack(2).clear().action(5, 10, (err, result) => {
    console.log(result) // 50
})
```

## Weld

Weld提供一個Function間互相引用的模型，也是Currying基礎模式。

> 這意味著所有的方法都指向同一個ng與sop。

```js
factory
    .tool('math', 'multiply')
    .pack(5, 10)
    .ng(console.error)
    .weld('sum', (result, pack) => { pack(result, 10) })
    .weld('sum', (result, pack) => { pack(result, 10) })
    .action(console.log) // 70
```

但Weld並不是Currying的最佳化實踐，我們必須試著[量身訂做](./currying.md)。
