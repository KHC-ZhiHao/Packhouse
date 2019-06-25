# Mold

`Mold`為分配參數時進行驗證與轉譯的物件，能夠保持型別正確與統一資料格式。

> Mold是為了簡單快速的判別而生的，如果判定需要更複雜，建議使用Tool來做為驗證與轉換機制。

```js
group.addMold({ 
    name: 'myFirstMold',
    description: 'Mold Description',
    check(parma, system) { return true },
    casting(parma) { return 'hello world.' }
})
```

---

## Options

### Name

* string
* require

Mold的名稱，不允許重複。

### Description

* string
* optional

對於Mold的敘述，不會有任何影響，但會被`getProfile`讀取到，可應用於測試或文件。

### Check

* function
* optional

驗證參數是否正確，回傳`true`及正確，回傳字串會被當作錯誤message被擲出。

```js
group.addTool({
    name: 'numberOnly',
    molds: ['number'],
    action(number, system, error, success) {
        success(number)
    }
})
group.alone().tool('numberOnly').ng(console.log).action(100, console.log) // 100
group.alone().tool('numberOnly').ng(console.log).direct('100') // Param 0 not a number(100).
```

### Casting

* function
* optional

當驗證成功後，`Casting`能協助轉換成統一的格式。

```js
group.addMold({ 
    name: 'double',
    check(param, system) {
        return typeof param === 'number' ? true : `Param ${system.index} not a number(${param}).`
    },
    casting(parma) {
        return parma * 2 //回傳參數 * 2
    }
})

group.addTool({
    name: 'useCastingTest',
    molds: ['double'],
    action(number, system, error, success) {
        success(number)
    }
})

group.alone().tool('useCastingTest').action(10, console.log) // 20
```

---

## 如何使用

### 在action中使用

> 第三個錯誤為如果check未通過時呼叫一個回乎函數，未設定在錯誤時會直出throw error。

```js
system.casting(moldName, value, error)
```

```js
group.addTool({
    name: 'moldTest',
    action(value, system, error, success) {
        success(system.casting('myFirstMold', value)) // hello world.
    }
})
```

### 從建立tool時宣告molds

傳入一個陣列依序宣告參數的Mold對象。

> 可以藉由null指定mold參數對象。

```js
group.addTool({
    name: 'moldTest',
    molds: [null, 'myFirstMold'],
    action(value, value2, system, error, success) {
        success(value2) // hello world.
    }
})
```

---

## Check System

`System`可以獲取`index`和`caller`外，還可以獲取使用`|`符號建立額外參數(extras)

```js
group.addMold({
    name: 'useSystem',
    check(param, system) {
        cosnole.log(system.index)  // 0
        cosnole.log(system.caller) // 'useSystemTest'
        cosnole.log(system.extras) // ['extrasValue', 'value2']
        return true
    }
})

group.addTool({
    name: 'useSystemTest',
    molds: ['useSystem|extrasValue|value2'],
    action(number, system, error, success) {
        success(number)
    }
})
```

---

## Public

`Public Mold`是個全局`Mold`，它可以被所有`Tool`引用，但如果與`Group`內的`Mold`同名，則以`Group`的`Mold`優先。

> Public Mold也是不允許被複寫的。

```js
let Packhouse = require('packhouse')

Packhouse.createPublicMold({
    name: 'firstPublicMold',
    check() { return true }
})

anyGroup.addTool({
    name: 'use public mold',
    molds: ['firstPublicMold'],
    action(number, system, error, success) {
        success(number)
    }
})
```

### 預設的Public Mold

預設的Public Mold有以下經常被使用的：

* number: 驗證是否為數字
* int: 驗證是否為數字並轉成整數
* string: 驗證是否為字串
* array: 驗證是否為陣列
* object: 驗證是否為物件
* function: 驗證是否為函數
* required: 驗證參數不能為空

> 以上的Public Mold都能接收一項abe(Allowed be empty)的參數，允許參數為空。

```js
group.addTool({
    name: 'numberOrNull',
    molds: ['number|abe'],
    action(number, system, error, success) {
        success(number)
    }
})
```
