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

`Packhouse`是一個基於函數式程式設計(Functional Programming)的設計模式模型，核心目的為使用微服務中的微服務，提供了強大的上下文追蹤與快取系統，適用於為FaaS服務建立良好的編程環境，例如AWS Lambda，最棒的是，`Packhouse`擁有一個美麗的階梯式編寫模式。

本庫不是那麼遵守函數式程式設計典範，但還是請您開始前可以閱讀下列文章了解Functional Programming的設計觀念。

[JS函數式編程指南](https://yucj.gitbooks.io/mostly-adequate-guide-traditional-chinese/content/)

<br>

## Install

npm
```bash
npm i packhouse --save
```

<br>

## 運行環境

Node 8.1以上。

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
            // return適用於中斷函式，但回傳值全由this.success或this.error處理，因此不能使用箭頭函數。
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
}

// 加入group是用lazy的模式
packhouse.add('math', () => {
    return {
        data: group
    }
})

packhouse.tool('math', 'sum').action(5, 10, (error, result) => {
    console.log(result) // 15
})
```

> tool是函數的基本單位，整個packhouse的系統都是圍繞著tool打轉。

---

### Action

上述的例子可以發現我們使用action調用sum這支tool，action是依照nodejs的callback設計，第一個參數為error，後者為結果，且內部函式如果沒有非同步處理，那本質上會是同步的。

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

---

### Promise

因為success與error可以無縫擔任resolve與reject的腳色，這讓每個tool都可以化身成promise，但promise本質上就是非同步的。

> 雖然有分同步與同步上的區分，但packhouse的原意就是將所有函式都視作非同步函數，減少開發上的擔憂。

```js
packhouse.tool('math', 'sum').promise(5, 10).then(r => console.log(r)) // 15
```

---

### Mold

了解mold前，我們先看看基於typescript的函數設計：

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

#### 使用casting在handler中做mold的驗證或轉換

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

#### 自定義mole表示式

```js
let group = {
    molds: {
        person(value, { extras }) {
            if (!(extras.boy && value.sex === boy)) {
                throw new Error('Sex not a boy.')
            }
            if (extras.minAge && value.age < Number(extras.minAge)) {
                throw new Error(`Age less ${extras.minAge}`)
            }
            return value
        }
    },
    tools: {
        greeter: {
            request: ['person|minAge:18|boy'],
            handler(person) {
                this.success('Hello, ' + person.firstName + ' ' + person.lastName)
            }
        }
    }
}
```

---

### 預處理

tool的action和promise是一個終點，在宣告它們之前可以預先宣告一些預處理。

#### Pack

預先加入參數。

```js
packhouse
    .tool('math', 'sum')
    .pack(5)
    .action(10, (error, result) => {
        console.log(result) // 15
    })
```

#### Repack

pack連續宣告會一直往下處理。

```js
packhouse
    .tool('math', 'sum')
    .pack(10, 20)
    .pack(30, 40)
    .action((error, result) => {
        console.log(result) // 30
    })
```

repack會強制從頭開始：

```js
packhouse
    .tool('math', 'sum')
    .pack(5)
    .pack(10)
    .repack(20, 30)
    .action((error, result) => {
        console.log(result) // 50
    })
```

#### Weld

把回傳值帶入給另一個tool，搭配pack可以建構初步的柯理化(Currying)概念。

```js
packhouse
    .tool('math', 'sum')
    .pack(10, 20)
    .weld('double', (result, pack) => pack(result))
    .action((error, result) => {
        console.log(result) // 60
    })
```

#### NoGood

如果失敗不執行成功的callback，重複註冊會被取代。

```js
// 如果宣告noGood，action callback的error會被捨去
packhouse
    .tool('math', 'sum')
    .noGood(error => {
        console.log(error) // Parameter 1 not a number(10).
    })
    .action(5, '10', (result) => {
        // 不會被執行
    })

// 如果是promise會被宣告reslove，這是需要注意的。
packhouse
    .tool('math', 'sum')
    .noGood(error => {
        console.log(error) // Parameter 1 not a number(10).
    })
    .promise(5, '10')

// 如果promise希望noGood同時被宣告且回傳reject，需在第二個參數賦予如下:
packhouse
    .tool('math', 'sum')
    .noGood(error => {
        console.log(error) // Parameter 1 not a number(10).
    }, {
        reject: true
    })
    .promise(5, '10')
```

#### Always

無論成功或失敗都會執行這個callback，重複註冊會被取代。

> always和finally的概念相同，它會在錯誤或成功的邏輯處理完畢後執行。

```js
packhouse
    .tool('math', 'sum')
    .always(result => {
        console.log(result) // 25
    })
    .action(5, 20, (error, result) => {
        console.log(result) // 25
    })
```

---

### 初始化

Group、Tool都有Install的階段，顧名思義就是第一次執行時會呼叫的方法。

```js
let group = {
    // options唯一對外交換資料的接口
    install(group, options) {
        // ...
    },
    tools: {
        myTool: {
            install(context) {
                // ...
            }
        }
    }
}
```

#### Group

Group物件可以在Install中被讀取到：

```js
let group = {
    install(group) {
        group.name = '123'
    },
    tools: {
        myTool: {
            install({ group }) {
                console.log(group.name) // '123'
            }
        }
    }
}
```

#### Store

Store物件會被綁定到Tool handler的this中。

```js
let group = {
    install(group) {
        group.name = '123'
    },
    tools: {
        myTool: {
            install({ store, group }) {
                // 這是tool與group交易資料的模式
                store.name = group.name
            },
            handler() {
                console.log(this.store.name) // name
            }
        }
    }
}
```

#### Utils

Utils提供了擴充方法與通用工具，詳細方法請參閱文件。

```js
let group = {
    tools: {
        myTool: {
            install({ store, utils }) {
                store.id = utils.generateId()
            },
            handler() {
                console.log(this.store.id) // uuid
            }
        }
    }
}
```

#### Include

引用其他tool甚至是引用其他group的方法。

> 深層的堆疊追蹤必須經由include引入才會被註冊至追蹤上下文中。

```js
let group = {
    tools: {
        sum: {
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        },
        sumAndDouble: {
            install({ include }) {
                // 先命名key，在選擇對象
                include('sum').tool('sum')
            },
            handler(v1, v2) {
                // 使用use關鍵字使用tool
                this.use('sum')
                    .noGood(this.error)
                    .action(result => {
                        this.success(result * 2)
                    })
            }
        }
    }
}
```

#### 更多應用方法

```js
let group2 = {
    tools: {
        sum: {
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
}
let group = {
    // mergers是一個重命名引用接口，主要在這加入需要的group。
    mergers: {
        'useGroup': 'group2'
    },
    tools: {
        sum: {
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        },
        sumAndDouble: {
            install({ include }) {
                // 對tool進行預處理
                include('sum').tool('sum').pack(10)
                // 引用line，line不會回傳任何值，因此無法預處理
                include('math').line('math')
                // 使用coop引用其他group
                include('sum2').coop('useGroup', 'tool', 'sum').pack(10)
            },
            handler() {
                // ...
            }
        }
    }
}

packhouse.add('group', () => {
    return {
        data: group
    }
})

packhouse.add('group2', () => {
    return {
        data: group2
    }
})
```

---

### Line

Line是上述所有方法的集大成結果，也是packhouse的柯里化模式。

```js
let group = {
    tools: {
        sum: {
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
    lines: {
        math: {
            request: ['number'],
            response: 'number',
            install({ include }) {
                // 從input到output所有的tool會共享this狀態
                include('sum').tool('sum')
            },
            input(value) {
                // 在line模式下除了output外的success不會影響輸出值，而是直接藉由store傳遞上下文
                this.store.value = value
                this.success()
            },
            output() {
                // 當line執行action或promise時會拋出結果
                this.success(this.store.value)
            },
            layout: {
                // layout基本上是一組簡單的tool群組
                add: {
                    request: ['number'],
                    handler(value) {
                        this.use('sum').action(this.store.value, value, this.success)
                    }
                },
                double: {
                    handler(value) {
                        this.store.value *= 2
                        this.success()
                    }
                }
            }
        }
    }
}

packhouse.line('groupName', 'math')(10).add(5).add(15).double().action((error, result) => {
    console.log(result) // 60
})
```

<br>

## Event與追蹤

packhouse對於函式做了過分的包裝，這一切都是為了追蹤運行過程，這也造就了packhouse不適合密集計算，我得承認它在互相引用tool時非常慢(如果你介意的是豪秒間的差異的話)，有趣的是這個架構原型是用於計算數學圖形快取運算用的。

```js
let Packhouse = require('packhouse')
let packhouse = new Packhouse()

// 每當只用group時被觸發
packhouse.on('run', (event, { type, name, group })) => {})

// 每當運行tool時被觸發，可以藉由當下id與caller來得知呼叫的上下文。
packhouse.on('run', (event, { id, caller, detail })) => {})

// 每當tool結束時被觸發
packhouse.on('done', (event, { id, caller, detail })) => {})
```

### 取消監聽

每次呼叫on會獲得一組id，可以藉由id來取消監聽對象：

```js
let id = packhouse.on('run', () => {})
packhouse.off('run', id)
```

也可以藉由callback的第一個參數來取消監聽：

```js
packhouse.on('run', (event) => {
    event.off()
})
```

<br>

## Merger與架構設計

有時我們會採用repository模式來做service串接的橋樑，merger即為此而生，每當外部要引用merger時必須加上命名空間，但內部使用mold、include時不需要。

```js
let merger = {
    molds: {
        myMold() {
            // mold code
        }
    },
    groups: {
        myGroup() {
            return {
                tools: {
                    myTool: {
                        handler() {
                            // do something...
                        }
                    }
                }
            }
        }
    }
}
// 將獲取以@區隔的命名空間
packhouse.merger('firstMerger', merger)
packhouse.tool('firstMerger@myGroup', 'myTool').action(() => {
    // ...
})
```

<br>

## AWS錯誤處理

AWS SDK的所有方法雖然都有提供promise接口，但它的promise有一個糟糕的問題，在有一定堆疊的呼叫時如果有程式碼報錯，promise會捉到catch卻不會觸發catch()。

```js
// 採用原生的錯誤處理來避免test失敗
let AWS = require('aws-sdk')
let client = new AWS.DynamoDB.DocumentClient()
let group = {
    tools: {
        getUser: {
            handler(name) {
                let parmas = {
                    TableName: 'users',
                    Key: {
                        name
                    }
                }
                client.get(params, (err, result) => {
                    if (err) {
                        this.error(err)
                    } else {
                        this.success(result)
                    }
                })
                // 避免如下宣告
                client.get(params).promise()
            }
        }
    }
}
```

<br>

## 總是新的開始

Nodejs的require有catch的特性，除非手動去清除它，否則它會存取上次使用過後的痕跡，這在Functional Programming是高風險的，意味著請將所有的初始化行為都編寫在install中，但這代表著實例化Packhouse後install的內容也不會重新來過，因此每次請求的過程都必須重新實例化Packhouse，以下是AWS Lambda的例子：

### 糟糕的做法

```js
let AWS = requrie('aws-sdk')
let Packhouse = require('packhouse')

let client = new AWS.DynamoDB.DocumentClient()
let packhouse = new Packhouse()

packhouse.add('db', () => {
    return {
        tools: {
            get: {
                handler() {
                    client.get({ ... }, () => { ... })
                }
            }
        }
    }
})

exports.handler = async () => {
    // bad :(
    packhouse.tool('db', 'get').action((() => { ... })
}
```

---

### 良好的做法

```js
let AWS = requrie('aws-sdk')
let Packhouse = require('packhouse')

exports.handler = async () => {
    let packhouse = new Packhouse()
    packhouse.add('db', () => {
        return {
            install(group) {
                group.client = new AWS.DynamoDB.DocumentClient()
            },
            tools: {
                get: {
                    install({ group, store }) {
                        store.client = group.client
                    },
                    handler() {
                        this.store.client.get({ ... }, () => { ... })
                    }
                }
            }
        }
    })
    // your code
}
```

<br>

## Pulgin

可以使用Pulgin來擴展Packhouse的能力。

```js
let Packhouse = require('packhouse')
let packhouse = new Packhouse()

class MyFirstPulgin {
    constructor(packhouse, options) {
        // do something...
    }
}

packhouse.plugin(MyFirstPulgin)
```

### Step

如果你使用的是npm安裝，意味著你可以使用我們提供的Step插件，加入Step可以讓packhouse足以擔任框架的腳色，建構整個服務。

> 同時Step也是一個標準的插件範例。

```js
let Packhouse = require('packhouse')
let packhouse = new Packhouse()
let step = require('packhouse/plugins/Step')

// 在引用step後獲得了step的能力，宣告後本質會是一個promise。
packhouse.plugin(Step)
packhouse.step({
    output(context, success) {
        success(this.result)
    },
    template: [
        function() {
            this.result = 10
        }
    ]
}).then(result => console.log(result) ) // 10
```

<br>

## 版本迭代

1.1.6與1.1.7發生了重大變革，大幅降低了使用所需的知識門檻與正規化模組，但相對的兩版本的相容性趨近於０。

關於1.1.6版文件如下：

[Guide](https://khc-zhihao.github.io/MyBook/Packhouse/static/)

[API Document](https://khc-zhihao.github.io/Packhouse/old/document/document.html)
