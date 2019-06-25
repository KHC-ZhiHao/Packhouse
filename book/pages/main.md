# Packhouse

在Serverless的可行性被確認後，人們便開始嘗試使用AWS Lambda作為API的邏輯處理層，我在工作中也得到了同樣的挑戰，我天真的開始建構物件，封裝所有的程式碼，但很快問題就來了，在以微服務為主的Serverless，呼叫服務的行為早就是封裝後的結果了，我們更需要的是**更彈性的處理**這些資料。

## 安裝

npm
```bash
npm i packhouse
```

web
```html
<script src="https://khc-zhihao.github.io/Packhouse/dist/index.js"></script>
<script>
    let factory = Packhouse.createFactory()
</script>
```

webpack
```js
import Packhouse from 'packhouse'
let factory = Packhouse.createFactory()
```

nodejs
```js
let Packhouse = require('packhouse')
let factory = Packhouse.createFactory()
```

---

## 為何使用 Packhouse ？

### Packhouse能夠統一IO模式

JS回傳條件狀態不明卻長期被詬病，是同步？非同步？還是`promise`？

別想這麼多了，一次滿足不就行了。

### 更細微的調用

如果每個行為都能獨立呼叫，就可以更深入地去測試錯誤訊息。

### 通用模組設計

Group可以獨立的使用，可以在各專案模組化移動。

---

## 第一支Function

以下分別是標準實踐總和與使用`Packhouse`實踐的差異：

#### 基本方法

```js
function sum(n1, n2) {
    return n1 + n2
}
```

#### Packhouse

```js
let factory = Packhouse.createFactory()
let math = Packhouse.createGroup()
math.addTool({
    name: 'sum',
    action(n1, n2, system, error, success) {
        success(n1 + n2)
    }
})

factory.addGroup('math', math)
let sum = factory.tool('math', 'sum').direct
console.log(sum(10, 10)) // 20
```

使用`Packhouse`複雜的跟鬼一樣，效能和建立成本都被基本方法打成白癡，但`Packhouse`默默地對函數做了封裝，從以下方法看見差異：

#### 基本方法

```js
function sum(n1, n2) {
    if (typeof n1 === 'number' && typeof n2 === 'number') {
        return n1 + n2
    } else {
        throw new Error('param not a number.')
    }
}
sum(10, '10') // throw 'param not a number.'
```

#### Packhouse

```js
let fact = Packhouse.createFactory()
let math = Packhouse.createGroup()
math.addTool({
    name: 'sum',
    molds: ['number', 'number'],
    action(n1, n2, system, error, success) {
        success(n1 + n2)
    }
})
fact.addGroup('math', math)
let sum = fact.tool('math', 'sum').ng(e => console.error(e)).direct
sum(10, '10') // param 1 not a number.
```

是的，基本方法除了throw error之外沒有其他方法，除非你賦予一個callback讓人們混淆這支`function`是否為非同步的，但`Packhouse`卻提供了可視的參數型別和錯誤乘載，在沒有宣告`ng()`的形況下sum會擲出error，但宣告後即呼叫callback。

# Functional Programming

`Packhouse`能夠幫助建立高細粒度的程式架構，但也因此充斥著陷阱，如果能夠遵照函數式程式設計的法則，將能夠協助避開地雷。

>[JS函數式編程指南](https://yucj.gitbooks.io/mostly-adequate-guide-traditional-chinese/content/)或許可以提供幫助。
