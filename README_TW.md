<p align="center"><img src="https://khc-zhihao.github.io/MyBook/Packhouse/images/logo.png"></p>

<p align="center" style="font-size:2em">Functional Programming Design Pattern</p>

<p align="center">
    <a href="https://www.npmjs.com/package/packhouse"><img src="https://img.shields.io/npm/v/packhouse.svg"></a>
    <a href="https://travis-ci.org/KHC-ZhiHao/Packhouse">
    <img src="https://travis-ci.org/KHC-ZhiHao/Packhouse.svg?branch=master" alt="travis-ci"  style="max-width:100%;">
    </a>
    <a href="https://coveralls.io/github/KHC-ZhiHao/Packhouse?branch=master">
        <img src="https://coveralls.io/repos/github/KHC-ZhiHao/Packhouse/badge.svg?branch=master" alt="Coverage Status"  style="max-width:100%;">
    </a>
    <a href="https://standardjs.com/">
        <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard Code Style"  style="max-width:100%;">
    </a>
    <a href="https://github.com/KHC-ZhiHao/Packhouse"><img src="https://img.shields.io/github/stars/KHC-ZhiHao/Packhouse.svg?style=social"></a>
    <br>
</p>

<br>

## 摘要

`Packhouse`是一個基於函數式程式設計(Functional Programming)的設計模式模型，核心目的為使用微服務中的微服務，適用於FaaS服務，例如AWS Lambda。

本庫不是那麼遵守函數式程式設計典範，但還是請您開始前可以閱讀下列文章了解Functional Programming的設計觀念。

[JS函數式編程指南](https://yucj.gitbooks.io/mostly-adequate-guide-traditional-chinese/content/)

<br>

## 開始

### 第一支函數

```js
const Packhouse = require('packhouse')
// 實例化
let packhouse = new Packhouse()
let group = {
    tools: {
        sum: {
            // return適用於中斷函式，但回傳值全由this.success或this.error處理，因此group並不能使用箭頭函數。
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
}
// 加入group並調用tool
packhouse.addGroup('math', group)
packhouse.tool('math', 'sum').action(5, 10, (error, result) => {
    console.log(result) // 15
})
```

> tool是函數的基本單位，整個packhouse的系統都是圍繞著tool打轉。

### Action

上述的例子可以發現我們使用action調用sum這支tool，action是依照nodejs的callback設計的，第一個參數為error，後者為結果，且內部函式如果沒有非同步處理，那本質上會是同步的。

> 下列之後的例子會省略建構packhouse的動作。

```js
let group = {
    tools: {
        sum: {
            handler(v1, v2) {
                if (typeof v1 + typeof v2 !== 'numbernumber') {
                    // 使用return中斷程式執行
                    return this.error('Param not a number.')
                }
                this.success(v1 + v2)
            }
        }
    }
}
packhouse.tool('math', 'sum').action(5, '10', (error, result) => {
    console.log(error) // Param not a number.
})
```

### Promise

因為success與error可以無縫擔任resolve與reject的腳色，這讓每個tool都可以化身成promise，但promise本質上就是非同步的。

> 雖然有分同步與同步上的區分，但packhouse的原意就是將所有函式都視作非同步函數，減少開發上的擔憂。

```js
packhouse.tool('math', 'sum').promise(5, 10).then(r => console.log(r)) // 15
```

### Mold

了解mold前，我們先看看基於typescript的函數設計：

> 雖然ts非常棒，但由於師出C#，我覺得他的設計本質是OOP。

```ts
// 基本函數
function sum(v1: number, v2: number): number {
    return v1 + v2;
}

// 基於interface
interface Person {
    firstName: string;
    lastName: string;
}

function greeter(person: Person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}
```

如上，mode就是負責處理參數結構，宣告模式如下：

```js
let group = {
    tools: {
        sum: {
            request: ['number', 'number'],
            response: 'number',
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
}
packhouse.tool('math', 'sum').action(5, '10', (error, result) => {
    console.log(error) // Parameter 1 not a number(10).
})
```

packhouse內部提供了基礎的mold，number便是其一，若想得知其他mold請參閱文檔。

#### 定義自己的mold

interface的實踐必須自己建立mold，可以分別建立在packhouse內成為全域的mold或只應用在group中。

> 不建議直接宣告mold在全域，這是給merger的接口。

```js
let packhouse = new Packhouse()
// 宣告在packhouse中
packhouse.addMold('person', function(value, { index }) {
    if (typeof value === 'object' && typeof value.firstName === 'string' && typeof value.lastName === 'string') {
        // mold的計算是基於同步的，它會將回傳的值放入tool對應的param中，意味著mold也可以作為資料轉換層
        return {
            firstName: value.firstName,
            lastName: value.lastName
        }
    }
    // 如果資料錯誤，使用throw關鍵字
    throw new Error(`Parameter ${index} validate error.`)
})

// 宣告在group
let group = {
    molds: {
        person(value, { index }) {
            // 定義如上相同的handler
        }
    },
    tools: {
        greeter: {
            // 如果group中有相同命名的mold則以group優先
            request: ['person'],
            handler(person) {
                this.success('Hello, ' + person.firstName + ' ' + person.lastName)
            }
        }
    }
}
```

#### 使用null忽略驗證

如果想跳過參數驗證可以使用null忽略驗證該參數。

```js
let group = {
    tools: {
        sum: {
            request: [null, 'number'],
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
}
```

#### 應用casting在handler中做mold的驗證或轉換

```js
let group = {
    tools: {
        sum: {
            handler(v1, v2) {
                try {
                    v1 = this.casting('number', v1)
                    this.success(v1 + v2)
                } catch (error) {
                    this.error(error)
                } 
            }
        }
    }
}
```

#### mold表示式

javascript允許預設參數數值，意味著有些參數不是必要的，給予abe(allow be empty)可以允許參數為null或undefined。

```js
let group = {
    tools: {
        sum: {
            request: ['number', 'number|abe'],
            handler(v1, v2 = 0) {
                this.success(v1 + v2)
            }
        }
    }
}
```

### 初始化

### support

### 柯里化

<br>

## Event與追蹤

> 嚴格來說，packhouse對於函式做了過分的包裝，這一切都是為了追蹤運行過程，這也造就了packhouse不適合密集計算，我得承認它在互相引用tool時非常慢(如果你介意的是微秒間的差異的話)，有趣的是這個架構原型是用於計算數學圖形快取運算用的。

## Merger與架構設計

## AWS錯誤處理

## 總是新的開始

<br>

## Install

npm
```bash
npm i packhouse --save
```

web
```html
<script src="https://khc-zhihao.github.io/Packhouse/dist/index.js"></script>
<script>
    let packhouse = new Packhouse()
</script>
```

webpack
```js
import Packhouse from 'packhouse'
let packhouse = new Packhouse()
```

nodejs
```js
let Packhouse = require('packhouse')
let packhouse = new Packhouse()
```

<br>

## 運行環境

Node 8.1以上。

<br>

## 版本迭代

1.1.6與1.1.7發生了重大變革，大幅降低了使用所需的知識門檻與正規化模組，但相對的兩版本的相容性趨近於０。

關於1.1.6版文件如下：

[Guide](https://khc-zhihao.github.io/MyBook/Packhouse/static/)

[API Document](https://khc-zhihao.github.io/Packhouse/old/document/document.html)