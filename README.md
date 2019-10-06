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

`Packhouse`是一個基於函數式程式設計(Functional Programming)的設計模式模型，核心目的為使用微服務中的微服務，提供了強大的上下文追蹤與快取系統，適用於為FaaS服務建立良好的編程環境，例如AWS Lambda。

`Packhouse`不是那麼遵守函數式程式設計典範，但還是請您開始前可以閱讀下列文章了解Functional Programming的設計觀念。

[JS函數式編程指南](https://yucj.gitbooks.io/mostly-adequate-guide-traditional-chinese/content/)

## Install

```bash
npm i packhouse --save
```

---

## 運行環境

Node 8.x以上。

---

## 開始

* [第一支函數](###第一支函數)

* [Mold](###Mold)

* [預處理](###預處理)

* [初始化](###初始化)

* [Utils](###Utils)

* [Include](###Include)

* [Line](###Line)

* [Event與追蹤](##Event與追蹤)

* [Merger](##Merger)

* [總是新的開始](##總是新的開始)

* [Pulgin](##Pulgin)

* [版本迭代](##版本迭代)

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

> `Tool`是函數的基本單位，整個`Packhouse`的系統都是圍繞著`Tool`打轉。

#### Action

上述的例子可以發現我們使用`Action`調用sum這支`Tool`，`Action`是依照Node的callback設計，第一個參數為error，後者為結果，且內部函式如果沒有非同步處理，那本質上會是同步的。

> 下列之後的例子會省略建構`Packhouse`的動作。

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

#### Promise

因為success與error可以無縫擔任resolve與reject的腳色，這讓每個`Tool`都可以化身成promise。

> 雖然有分同步與同步上的區分，但`Packhouse`的原意就是將所有函式都視作非同步函數，減少開發上的擔憂。

```js
packhouse.tool('math', 'sum').promise(5, 10).then(r => console.log(r)) // 15
```

---

### Mold

了解`Mold`前，我們先看看基於TypeScript的函數設計：

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

如上，`Mold`就是負責處理參數結構，宣告模式如下：

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

`Packhouse`內部提供了基礎的`Mold`，如下：

```js
let group = {
    tools: {
        sum: {
            request: [
                'type|is:string|abe', // type是參照units.getType，因此一定要搭配is參數
                'boolean|abe',
                'number|max:0|min:0|abe',
                'int|max:0|min:0|abe',
                'string|abe',
                'array|abe',
                'buffer|abe',
                'object|abe',
                'function|abe',
                'date|abe', // 符合new Date規格的形式
                'required'
            ]
        }
    }
}
```

#### 定義自己的Mold

Interface的實踐必須自己建立`Mold`，可以分別建立在`Packhouse`內成為全域的`Mold`或只應用在當下的`Group`中。

> 不建議直接宣告`Mold`在全域，相關方法請參閱`Merger`。

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

#### 使用Casting在Handler中做Mold的驗證或轉換

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

#### Mold表示式

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

#### 自定義Mold表示式

```js
let group = {
    molds: {
        person(value, { extras }) {
            if (!(extras.boy && value.sex === 'boy')) {
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

`Tool`的`Action`和`Promise`是一個終點，在宣告它們之前可以預先宣告一些預處理。

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

`Pack`連續宣告會一直往下處理。

```js
packhouse
    .tool('math', 'sum')
    .pack(10, 20)
    .pack(30, 40)
    .action((error, result) => {
        console.log(result) // 30
    })
```

`Repack`會強制從頭開始：

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

把回傳值帶入給另一個`Tool`，搭配`Pack`可以建構初步的柯理化(Currying)概念。

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

`Group`與`Tool`、`Line`都有`Install`的階段，顧名思義就是第一次執行時會呼叫的方法。

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

`Group`物件可以在`Install`中被讀取到：

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

`Store`物件會被綁定到`Tool Handler`的this中。

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

---

### Utils

`Utils`提供了擴充方法與通用工具。

```js
let Packhouse = require('packhouse')
let packhouse = new Packhouse()
console.log(packhouse.utils.generateId()) // uuid
```

#### 在Handler中使用Utils

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

#### 在Mold中使用Utils

```js
let group = {
    molds: {
        generateId(value, { utils }) {
            return utils.generateId()
        }
    }
}
```

#### 可用方法

##### getType

```js
packhouse.utils.getType([]) // array
packhouse.utils.getType(NaN) // NaN
packhouse.utils.getType(null) // empty
packhouse.utils.getType(undefined) // empty
packhouse.utils.getType(/test/) // regexp
packhouse.utils.getType(new Promise(() => {})) // promise
packhouse.utils.getType(Buffer.from('123')) // buffer
packhouse.utils.getType(new Error()) // error
```

##### verify

```js
let options = {
    a: 5,
    b: []
}
let data = packhouse.utils.verify(options, {
    a: [true, ['number']], // [required, allow types, default value]
    b: [true, ['array']],
    c: [false, ['number'], 0]
})
console.log(data.a) // 5
console.log(data.c) // 0
```

##### generateId

產生一組仿uuid隨機字串。

```js
let id = packhouse.utils.generateId()
```

##### arrayCopy

基本上就是array.slice()的功能，不過比較快。

```js
let newArray = packhouse.utils.arrayCopy([])
```

##### peel

可以獲得指定的路徑對象的值，找不到回傳undefined。

```js
let a = {
    b: {
        c: {
            d: 5
        }
    }
}
console.log(packhouse.utils.peel(a, 'b.c.d')) // 5
```

---

### Include

引用其他`Tool`甚至是引用其他`Group`的方法。

> 深層的堆疊追蹤必須經由`Include`引入才會被註冊至追蹤上下文中。

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

`Line`是上述所有方法的集大成結果，也是`Packhouse`的柯里化函式的標準模型。

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
                        this.use('sum')
                            .noGood(this.error)
                            .action(this.store.value, value, result => {
                                this.store.value = result
                                this.success()
                            })
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

---

## Event與追蹤

`Packhouse`對於函式做了大量的包裝，這一切都是為了追蹤運行過程，這也造就了`Packhouse`不適合密集計算，我得承認它在互相引用`Tool`時非常慢(如果你介意的是豪秒間的差異的話)，有趣的是這個架構原型是用於計算數學圖形快取運算用的。

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

每次呼叫`on`會獲得一組id，可以藉由id來取消監聽對象：

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

---

## Merger

有時我們會採用repository模式來做service串接的橋樑，`Merger`即為此而生，每當外部要引用`Merger`時必須加上命名空間，但內部使用時不需要。

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
                data: {
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
}
// 將獲取以@區隔的命名空間
packhouse.merger('firstMerger', merger)
packhouse.tool('firstMerger@myGroup', 'myTool').action(() => {
    // ...
})
```

---

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

---

## 總是新的開始

Node的require有catch的特性，除非手動去清除它，否則它會存取上次使用過後的痕跡，這在Functional Programming是高風險的，意味著請將所有的初始化行為都編寫在install中，但這代表著實例化`Packhouse`後install的內容也不會重新來過，因此每次請求的過程都必須重新實例化`Packhouse`，以下是AWS Lambda的例子：

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
    // begin your code...
}
```

---

## Pulgin

可以使用`Pulgin`來擴展`Packhouse`的功能。

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

### Order

`Order`是一個對付短暫同時間的相同條件密集請求時的快取物件，在第一次請求的結果回來前，之後的所有請求都會等待第一次的請求回傳的結果。

> 在Functional Programming常見對同一筆條件送出好幾次請求，因為我們必須把每次請求當作是一個新的服務，就算鍵值相同，但這也意味著不必要的效能浪費。

```js
let Packhouse = require('packhouse')
let Order = require('packhouse/plugins/Order')
let packhouse = new Packhouse()

packhouse.plugin(Order)

let group = {
    tools: {
        sum: {
            install({ store, utils }) {
                // order會被綁訂在utils上
                store.order = utils.order()
            },
            handler(v1, v2) {
                // key, { success, error }, callback
                this.store
                    .order
                    .use(v1 + '+' + v2, this, (error, success) => {
                        success(v1 + v2)
                    })
            }
        }
    }
}

packhouse.add('math', () => {
    return {
        data: group
    }
})

packhouse.tool('math', 'sum').action(10, 20, (error, result) => {
    console.log(result) // 30
})
```

---

### Step

`Step`可以讓`Packhouse`足以擔任框架的腳色，建構整個服務。

```js
let Packhouse = require('packhouse')
let Step = require('packhouse/plugins/Step')
let packhouse = new Packhouse()

// 在引用step後獲得了step的方法，宣告後回傳一個promise。
packhouse.plugin(Step)
packhouse.step({
    create: function() {
        // 由於this是共享的，create可以協助註冊this
        this.result = 0
    },
    middle: function({ exit }) {
        // 可以在template之間設定跳出條件
        if (this.result > 10) {
            exit()
        }
    },
    timeout: 20000, // ms
    failReject: false, // step成功或失敗都會呼叫reslove，如果需要錯誤請宣告成true
    output({ timeout, history }, success) {
        console.log(timeout) // 如果是timeout則宣告成true
        console.log(history.toJSON()) // step會協助你建立追蹤過程，並輸出詳細資料
        success(this.result)
    },
    template: [
        function() {
            this.result = 10
        }
        // 你的邏輯
    ]
}).then(result => console.log(result) ) // 10
```

---

## 版本迭代

1.1.6與1.1.7發生了重大變革，大幅降低了使用所需的知識門檻與正規化模組，但相對的兩版本的相容性趨近於０。

關於1.1.6版文件如下：

[Guide](https://khc-zhihao.github.io/MyBook/Packhouse/static/)

[API Document](https://khc-zhihao.github.io/Packhouse/old/document/document.html)
