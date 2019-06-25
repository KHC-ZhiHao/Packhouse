# Line

柯里化(Currying)是函數式設計的一項指標，在`Packhouse`也不例外，我們可以使用Line建立柯理化函式。

```js
group.addLine({
    name: 'string',
    fail: function() {},
    inlte: ['string', 'string', ...],
    input: function() {},
    output: function() {},
    layout: {}
})
```

---

## Options

### Input

* function
* require

為執行的入口。

> `Line`並沒有預處理的功能，每次執行`Line`都是新的建置，包括`this`都會刷新。

```js
let input = function(number, system, error, next) {
    this.number = number
    next()
}
```

### Output

* function
* require

輸出資料的出口，無法接受任何參數。

```js
let output = function(system, error, success) {
    success(this.number)
}
```

### Fail

* function
* require

當執行`error`都會進入`fail`並`report`出失敗，而`error`有`message`和`stack`兩種屬性。

```js
let fail = function(error, report) {
    report(error.message)
}
```

### Layout

* object
* require

可以呼叫的函數列。

> 切記this是line宣告後共享的，避免使用箭頭函數。

```js
let layout = {
    // 這是可以定義細節的宣告模式，input也支援此方法
    add: {
        molds: ['number'],
        action: function(number, system, error, next) {
            this.number += number
            next()
        }
    },
    // 這是簡易的宣告模式
    double: function(system, error, next) {
        this.number = this.number * 2
    }
}
```

#### 系統Layout

以下這幾個名稱是系統層所需要，不可宣告在`layout`內。

> line不支援direct

* setRule : 同tool rule
* action : 接受一個callback
* promise : 回傳一個promise

##### Layout不完全是tool

input, layout都是tool的變體，不一定需要藉由function去建立，也可以傳入一份options使用tool的功能。

> 目前實質上的差異也只有success為next和不支援name屬性。

> output和fail是獨立的個體，只支援function型態。

### Inlet

* array
* optional

嚴格設定進入點，除了input外，inlet會限制第一次呼叫layout的對象。

```js
let inlet = ['add']
```

---

## 呼叫

```js
group.addLine({
    name: 'math',
    input,
    inlet,
    output,
    fail,
    layout
})

let math = group.alone().line('math')
math(5).setRule(console.error).add(10).double().action(console.log) // 30
```