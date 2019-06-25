# Tool

`Tool`是`Packhouse`的基本單位。

```js
group.addTool({
    name: 'myFirstTool',
    molds: ['string', 'string', ...],
    updateTime: 64000,
    paramLength: 0,
    description: '',
    allowDirect: false,
    create(store, system) {},
    update(store, system) {}
    action(system, error, success) {}
})
```

---

## Options

### Name

* string
* require

`tool`的名稱，不允許重複宣告。

### Action

* function
* require

主要邏輯層面，當外部執行`tool`時，`action`宣告`success`則回傳宣告的值，`error`則經由各系統錯誤的管道被擲出。

### Create

* function
* optional

當`tool`被第一次呼叫時會載入`create`，此時再載入必要的套件，可視為`lazy`行為。

> store與system.store有本質上的差異，基本上system.store被proxy保護著，在group宣告secure的情況下無法改變數值。

### Update

* function
* optional

可以指定時間或被動的宣告`update`，甚至可以被其他`tool`呼叫。

> store與system.store有本質上的差異，基本上system.store被proxy保護著，在group宣告secure的情況下無法改變數值。

> update並不是為`serverless`設立的，雖說它的存在有其用途，但盡可能使用避免狀態被改變。

### Molds

* array
* optional

指定參數需要被哪個mold給解析。

### Description

* string
* optional

對於Tool的敘述，不會有任何影響，但會被`getProfile`讀取到，可應用於測試或文件。

### AllowDirect

* boolean
* optional

使否允許該tool執行direct的行為，基本上非同步狀態下都是不允許direct的。

### ParamLength

* number
* optional

宣告參數數量，`PackHouse`有自動解析參數的方法，但指定參數長度可以跳過這個過程，加快程序進行。

### UpdateTime

* number(ms)
* optional

指定多少毫秒後宣告一次`update`行為，這狀態不是即時的，它會在被呼叫的當下判定逾時與否決定是否呼叫。

---

## System

在`action`、`create`，`update`都能接收一個`system`參數，它提供了一些接口和方法。

### Store

獲取`Store`，在`Group`宣告`secure`無法修改。

```js
system.store.foo = 'bar'
```

### Include & Tool

引入`Group`內的其他`Tool`。

> 兩者同意，tool為include的簡寫

```js
system.tool('toolName').action(...)
```

### Line

引入`Group`內的其他`Line`。

```js
system.line('lineName')(...).action(...)
```

### Group

使用隸屬`Group`的值。

```js
console.log(system.group.foo) // bar
```

### Coop

可以引用`Group`的`merger`對象。

```js
system.coop('mergerName').tool('toolName').action(...)
```

### Update & UpdateCall

呼叫`update`或呼叫其他`Tool`的`update`。

```js
system.update() // 執行自己的update
system.updateCall('toolName') // 執行指定tool的update
```

### Casting

手動使用`Mold`。

> 第三個參數只有在check錯誤時才會被呼叫。

```js
system.casting('int', 1.87, (e) => console.error(e)) // 1
```

---

## 呼叫模式

當呼叫`Tool`時必須要指定呼叫的模式，由此決定`Tool`呼叫的行為。

### Store

`Store`是一個獲取狀態的接口，可以藉由store()獲取內部的值。

```js
console.log(group.alone().tool('toolName').store('foo')) // bar
```

### Direct

可以直接獲得`success`的宣告值。

```js
console.log(group.alone().tool('double').direct(20)) // 40
```

### Action

使用`callback`接收回傳值。

> Action的最後一個參數必為callback。

```js
group.alone().tool('double').action(20, (err, result) => {
    console.log(result) // 40
})
```

### Promise

回傳一個`Promise`。

```js
group.alone().tool('double').promise(20).then((result) => {
    console.log(result) // 40
})
```

### Recursive 🔬

基於`action`的遞迴行為。

> 這是一個實驗功能。

> Recursive的最後一個參數必為callback。

```js
group.alone().tool('double').recursive(20, (err, result, context) => {
    // 宣告stack反覆執行action行為直到結果 > 80
    if (result < 80) {
        context.stack(result)
    }
})
```

---

## 預處理

`PackHouse`賦予了函數彈性預處理的方法，能夠精簡美化程式碼繁複的處理，必須在呼叫方法前宣告。

### Packing

預先加入參數。

```js
console.log(group.alone().tool('double').packing(20).direct()) // 40
```

也可以一次加入多個參數。

```js
console.log(group.alone().tool('sum').packing(20, 10).direct()) // 30
```

也可以分開加入多個參數。

```js
console.log(group.alone().tool('sum').packing(20).packing(10).direct()) // 30
```

當然，也可以無視前面所有的設定直接取代。

```js
console.log(group.alone().tool('sum').acking(20).packing(10).rePacking(20, 20).direct()) // 40
```

### NoGood

錯誤預乘載，這個方法會導致錯誤處理的狀態變動。

```js
group.alone().tool('sum').ng((error) => {
    console.error(error)
})
```

#### Direct

在Direct的呼叫方法下，遇到錯誤處理會直接throw error，但在宣告ng後會呼叫error callback。

```js
console.log(group.alone().tool('double').ng(errorCallback).direct('10')) // param 0 not a number.
```

#### Action & Recursive

在Action與Recursive的呼叫方法下，callback第一個error參數會被移除。

```js
group.alone().tool('double').ng(errorCallback).action(10, (result) => {
    console.log(result) // 20
})
```

#### Promise

在Promise的呼叫方法下，仍會宣告`reject`且呼叫callback，你可以賦予第二個參數要求它錯誤也執行`resolve`。

```js
group.alone().tool('double').ng(errorCallback, {
    resolve: true
}).promise('10').then((result) => {
    console.log(result) // null
})
```

### Weld

焊接同Group的Tool，可以共享錯誤處理，為Curring的初階模型。

> 必須留意呼叫順序，先執行action再執行weld。

```js
let result = group.alone().tool('double').weld('sum', (result, packing) => { packing(result, 10) }).direct(20)
console.log(result) // 50
```

### S.O.P

不論錯誤或成功都會執行`sop`，可以處理一些共通邏輯。

> Recursive只要執行一次就會宣告一次SOP。

```js
group.alone().tool('double').sop((context) => {
    console.log(context.success) // true
    console.log(context.result) // 40
}).direct(20)
```

### Rule

NoGood和S.O.P的統一處理介面，有時候可以讓程式碼美觀一點。

```js
group.alone().tool('double').rule(ngCallback, sopCallbakc, ngOptions).direct(20)
```

### Clear

移除所有預乘載。

> 每個單元都有自己的移除方法，詳情請參閱文件。

```js
group.alone().tool('double').clear()
```

---

## Replace

替換任何指定的行為。

> 注意！這狀態用於調適或測試使用，他會直接更動Tool的行為。

### 替換掉動作

```js
group.alone().tool('double').replace({
    action(number, system, error, success) {
        // 這個double不論在哪呼叫都會 * 3，即該系統產生錯誤
        success(number * 3)
    }
})
```

### 用在調適狀態

假如我們要測試一個功能觸及到外部狀態，但我們並沒有實際的環境時，可以更改它的行為來達到單元測試的目標。

```js
let fs = require('fs')

group.addTool({
    name: 'getFile',
    action(system, error, success) {
        success(fs.readFileSync('./index.html'))
    }
})

group.alone().tool('getFile').replace({
    action(number, system, error, success) {
        success('<div>777777</div>')
    }
})
```
