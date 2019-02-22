# Packhouse

[![NPM Version][npm-image]][npm-url]

## 簡介

javascript是一個基於非同步驅動，且有數種呼叫function的概念，這點讓js於functional programming設計下險些困難。

而Packhouse是一個函數包裝器，求助些許物件導向的概念，編寫出來的function可以泛用各種型態，並適應鍊式寫法。

## 安裝

npm
```bash
npm i packhouse
```

web
```html
<script src="./dist/index.js"></script>
```
```js
let factory = new Packhouse()
```
webpack
```js
import Packhouse from 'packhouse'
let factory = new Packhouse()
```
nodejs
```js
let Packhouse = require('packhouse')
let factory = new Packhouse()
```

## 如何開始

### 建立工廠

Packhouse是集結Group的工廠

> Bridge是每次從工廠呼叫function時都會執行的函式，初始目的是為了動態載入group

```js
let factory = new Packhouse()
factory.setBridge((factory, groupName, toolName) => {
    if (factory.hasGroup(groupName) === false) {
        factory.addGroup(groupName, require(`./${groupName}`))
    }
})
```

### Group

所有的function都必須在group下建構，因此建立group是第一步。

```js
let group = new Packhouse.Group()
```

當group被Packhouse引入時可以藉由create客製化屬性，可用於模組化管理

> alias只賦予系統訊息的命名，而非factory呼叫的key

```js
let group = new Packhouse.Group({
    alias: 'math',
    create(options) {
        this.options = options // {coefficient: 5}
    }
})
factory.addGroup('math', group, {
    coefficient: 5
})
```

#### Alone

獨立Group，使其不再受Factory管制。

```js
let group = new Packhouse.Group({
    create(options) {
        this.options = options // {coefficient: 5}
    }
})
group.addTool({
    name: 'sum',
    allowDirect: true,
    action: function(a, b, { include, group, store }, error, success) {
        success(a + b)
    }
})
let alone = group.alone({
    coefficient: 5
})
alone.tool('sum').direct(5, 10) // 15
```

#### Merger And Coop

Merger是Group互相引用的接口

> Merger的Group也會觸發create，請避免把負責被引用的Group加入Factory，除非他不需要接收外部參數

```js
let valid = new Packhouse.Group()
valid.addTool({
    name: 'validNumber',
    action: function(number, { include, group, store }, error, success) {
        if (typeof number === "number") {
            success()
        } else {
            error()
        }
    }
})

let math = new Packhouse.Group({
    merger: { valid }
})

math.addTool({
    name: 'double',
    action: function(number, { include, group, store, coop }, error, success) {
        coop('valid').tool('validNumber').ng(error).action(number, () => {
            success(number * 2)
        })
    }
})
```

### Tool

Tool是一個裝載function的單位，由group建造

>Packhouse帶有一個參數解析器，但在js不斷突變的狀況下，我無法保證該解析器能夠處理所有狀況，盡可能使用paramLength來處理，且定義paramLength將跳過執行解析器的動作，可以提供良好的效能

```js
group.addTool({
    // (Require) function name
    name: 'sumAndAdd5',
    // 是否支援直接回傳，若有非同步處理請關閉(預設:true)
    allowDirect: true,
    // 手動定義參數長度
    paramLength: 2,
    // 在喚醒這個tool時建立
    create: function(store, { include, group }) {
        store.hello = 'world' // store是一個對外物件，你有需要的時候就會想到它的
        this.add = group.options.coefficient
    },
    // (Require) 對於外部來看這是個function(a,b)，並沒有其他參數
    action: function(a, b, { include, group, store }, error, success) {
        success(a + b + this.add)
    }
})
```

#### 呼叫function

```js
let sumAndAdd5 = factory.tool('math', 'sumAndAdd5')
sumAndAdd5.store('hello') // 'world'
sumAndAdd5.direct(5, 10) // 20
sumAndAdd5.action(5, 10, (err, result) => {
    console.log(result) // 20
})
sumAndAdd5.promise(5, 10).then((result) => {
    console.log(result) // 20
})

// look for normal function.
let saa5 = sumAndAdd5.direct
saa5(5, 10) // 20
```

#### 預填裝

```js
let sumAndAdd5 = factory.tool('math', 'sumAndAdd5').packing(5, 10)
sumAndAdd5.direct() // 20
let sumAndAdd5 = factory.tool('math', 'sumAndAdd5').packing(5)
sumAndAdd5.direct(15) // 25
let sumAndAdd5 = factory.tool('math', 'sumAndAdd5').packing(5).packing(5)
sumAndAdd5.direct() // 15
```

#### 解除預填裝

```js
let sumAndAdd5 = factory.tool('math', 'sumAndAdd5').packing(5, 10).unPacking().direct(5, 5) // 15
```

#### 預監聽錯誤

NG將協助你捕捉錯誤或優化程式碼

```js
group.addTool({
    name: 'errorDemo',
    allowDirect: true,
    action: function(a, b, { include, group, store }, error, success) {
        let t = Math.random() > 0.5 ? error : success
        t()
    }
})
```

##### action

action預先呼叫錯誤，最後的callback將忽略賦予error

```js
factory.tool('math', 'errorDemo').ng((err)=>{
    console.log(err)
}).action((res) => {
    console.log(res)
})
```

##### direct

direct原本在錯誤處裡上會直接throw error，但預處理則呼叫callback

```js
factory.tool('math', 'errorDemo').ng((err)=>{
    console.log(err)
}).direct()
```

##### promise

promise在遭遇錯誤仍然會宣告reject，但同時執行錯誤的回呼函式

```js
factory.tool('math', 'errorDemo').ng((err)=>{
    console.log(err)
}).promise()
```

### Mold

Mold是一個參數配裝器，只支援同步處理，用於參數驗證與型態轉換。

```js
group.addMold({
    // (Require) mold name
    name: 'int',
    // 回傳非true及驗證錯誤與回傳訊息
    check(param) {
        return typeof param === 'number' ? true : 'Not a number.'
    },
    // 參數處理
    casting(param) {
        return Number.floor(param)
    }
})
```

```js
group.addTool({
    name: 'multiply',
    mold: [null, 'int'], //設定b參數一定要整數
    action: function(a, b, system, error, success) {
        success(a * b)
    }
})

factory.tool('math', 'multiply').direct(5.5, 10) // 55
factory.tool('math', 'multiply').direct(10, 5.5) // 50
factory.tool('math', 'multiply').direct(10, '5.5') // error 'Not a number.'
```

#### public mold(v1.0.1)

全域宣告的mold，可以定義一些通用的mold，需要注意的是，public mold是可以**複寫**的。

>當group中有同名優先宣告的mold，則group優先

```js
Packhouse.createPublicMold({
    name: 'double',
    check(param) {
        return typeof param === 'number' ? true : 'Param not a number.'
    },
    casting(param) {
        return param * 2
    }
})

group.addTool({
    name: 'double',
    mold: ['double'],
    action: function(a, system, error, success) {
        success(a)
    }
})
```

於1.0.1板後可以用system呼叫casting使用mold。

>第三個參數為錯誤回呼，當casting check不正確時才會呼叫。

```js
group.addTool({
    name: 'system_double',
    action: function(a, system, error, success) {
        let b = system.casting('double', a, error)
        success(b)
    }
})
```

#### 預設的public mold(v1.0.1)

系統將自動預設幾個常態性的public mold

* number: 驗證是否為數字
* int: 驗證是否為數字並轉成整數
* string: 驗證是否為字串
* array: 驗證是否為陣列
* object: 驗證是否為物件
* function: 驗證是否為函數

## 生產線

建構生產線是一個函數柯理化(curry)的過程，在這之前，先將整個function給定義好

>include是一個Tool互相溝通的接口，作用域只到當下的group

```js
let math = new Packhouse.Group()
math.addTool({
    name: 'isNumber',
    allowDirect: false,
    action: function(params, { include }, error, success) {
    	let values = params.filter((n) => {
            return typeof n !== 'number'
        })
        if (values.length === 0) {
            success(true)
        } else {
            error('no number')
        }
    }
})
math.addTool({
    name: 'sum',
    allowDirect: true,
    action: function(a, b, { include }, error, success) {
        include('isNumber').action([a, b], (err) => {
            if (err == null) {
            	success(a + b)
            } else {
                error(err)
            }
        })
    }
})
math.addTool({
    name: 'double',
    allowDirect: true,
    action: function(number, { include }, error, success) {
        include('isNumber').action([number], (err) => {
            if (err == null) {
                success(number * 2)
            } else {
                error(err)
            }
        })
    }
})

factory.addGroup('math', math)
```

### 建構生產線

和Tool一樣，生產線仍依附在group上

```js
group.addLine({
    name: 'compute',
    // 初始化是難免的，inlet會限制第一個呼叫的function，當其為null或空陣列時不限制
    inlet: ['add'],
    // 每次執行line都會刷新this的屬性
    input: function(number, { include }, error, start) {
    	this.number = number
        start()
    },
    output: function({ include }, error, success) {
    	success(this.number)
    },
    // 當執行鍊中觸發error就會觸發fail，err:{ stack, message} 的物件
    fail: function(err, report) {
    	report(err)
    },
    // layout為一個鍊中能呼叫的函數表，實質為Tool個體
    layout: {
        add: function(number, { include }, error, next) {
            include('sum').action(this.number, number, (err, result) => {
                if (err) {
                    error(err)
                } else {
                    this.number = result
                    next()
                }
            })
        },
    	double: function({ include }, error, next) {
            include('double').action(this.number, (err, result) => {
                if (err) {
                    error(err)
                } else {
                    this.number = result
                    next()
                }
            })
        }
    }
})
```

### 執行生產線

將5丟進去input之後，經由生產線擲出result

>line不支援direct

```js
factory.line('math', 'compute')(5).add(10).double().double().action((err, result) => {
    console.log(result) // 60
})
factory.line('math', 'compute')(5).add(10).double().promise().then((result) => {
    console.log(result) // 30
})
```

## 其他
[版本LOG](https://github.com/KHC-ZhiHao/Packhouse/blob/master/document/version.md)

[開發者文件](https://khc-zhihao.github.io/Packhouse/document/document.html)

[npm-image]: https://img.shields.io/npm/v/packhouse.svg
[npm-url]: https://npmjs.org/package/packhouse