<p align="center"><img src="./images/logo.png"></p>

--- 

<p align="center" style="font-size:2em">Functional Programming Library</p>
<p align="center">
    <a target="_blank" href="https://www.npmjs.com/package/packhouse"><img src="https://img.shields.io/npm/v/packhouse.svg"></a>
    <a target="_blank" href="https://github.com/KHC-ZhiHao/Packhouse"><img src="https://img.shields.io/github/stars/KHC-ZhiHao/Packhouse.svg?style=social"></a>
</p>

# Summary

Packhouse是一個瘋狂的函數包裝器，你可以使用各種奇淫技巧讓函式擁有下列能力：

* 預處理
* 事件監聽
* 統一IO
* 模組化管理
* 參數驗證與轉換
* Step Function
* Currying Function

## Cloud Function

AWS Lambda是Packhouse的出生地，那個狗幹的調適環境與垃圾級別的測試真是一場惡夢，雖然能用外掛切入補足各種缺陷，但雲端供應商照三餐改變規則正摧毀著你日前所學習的一切，我只好拖著那疲憊又傷痕累累的身軀回頭找那永不會放棄我的老朋友--程式碼，最極端的方式找到存活的方法。

## 函數式程式設計

雖然Packhouse不是那麼遵守函數式程式設計典範，但還是請您開始前可以閱讀下列文章了解`FP`的設計觀念。

[JS函數式編程指南](https://yucj.gitbooks.io/mostly-adequate-guide-traditional-chinese/content/)

# First Function

```js
const Packhouse = require('packhouse')
let factory = Packhouse.createFactory()
let math = {
    tools: {
        sum: {
            action(a, b) {
                this.success(a + b)
            }
        }
    }
}
factory.addGroup('math', math)
let sum = factory.tool('math', 'sum').promise
sum(5, 2).then(console.log) // 7
```

# Install

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

# 運行環境

Node 8.1以上。

要運行在瀏覽器也可以，但本庫在編寫時不會考慮瀏覽器相容性。
