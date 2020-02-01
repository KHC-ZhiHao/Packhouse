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
    <a href="https://lgtm.com/projects/g/KHC-ZhiHao/Packhouse/context:javascript"><img alt="Language grade: JavaScript" src="https://img.shields.io/lgtm/grade/javascript/g/KHC-ZhiHao/Packhouse.svg?logo=lgtm&logoWidth=18"/></a>
    <a href="https://github.com/KHC-ZhiHao/Packhouse"><img src="https://img.shields.io/github/stars/KHC-ZhiHao/Packhouse.svg?style=social"></a>
    <br>
</p>

<br>

## Summary

[完整教學文件](https://packhouse-doc.metalsheep.com/)

Packhouse是一個基於函數式程式設計(Functional Programming)的程式設計模型，其擁有以下特性：

* 追蹤呼叫上下文
* 真正的型態檢查
* 管理與分類函式
* 美麗的寫作規範
* 建構後端服務的能力

> 開始前可以閱讀[函數式編程指南](https://yucj.gitbooks.io/mostly-adequate-guide-traditional-chinese/content/)了解基本觀念。

---

### 為何採用Packhouse？
1. Packhouse開發可以建構統一的Input/Output接口。

2. Packhouse的精神是建構微服務中的微服務，建立細微可控的函式能夠快速反應需求變更，且如果保持函數式編程的核心理念，便可以在專案破碎化的情況下複製模式到各個專案中。

3. 並不是所有的專案都能運行TypeScript，而Packhouse是原生的JavaScript，不需要經由任何編譯就能執行。

4. 編寫Cloud Function時將所有的邏輯編寫在一個檔案中難以應付頻繁的需求變更，物件導向開發在minify或編譯後難以除錯，雖然我們可以藉由單元測試來避免錯誤，但上線後會發生的事永遠比開發時離奇。

---

### 無伺服器架構 - Serverless

> 你不需要逐步建立服務，可以直接參考[API Service](https://packhouse-doc.metalsheep.com/application/api-service)章節。

無伺服器架構是Packhouse絕佳的運作平台：

[Serverless Framework](https://serverless.com/)

[AWS Serverless Application](https://docs.aws.amazon.com/zh_tw/serverlessrepo/latest/devguide/using-aws-sam.html)

---

### 安裝

```bash
npm i packhouse --save
```

---

### 運行環境

Node 8.x以上。

> Packhouse並沒有強制必須於哪個環境下運作，它甚至允許於瀏覽器執行，但我們不會在乎瀏覽器兼容性。

---

### First Function

以下是最低限度地執行程式：

```js
const Packhouse = require('packhouse')
const packhouse = new Packhouse()
const group = {
    tools: {
        sum: {
            handler: (self, v1, v2) => self.success(v1 + v2)
        }
    }
}

packhouse.addGroup('math', () => {
    return {
        data: group
    }
})

packhouse
    .tool('math/sum')
    .action(10, 20, (error, result) => {
        console.log(result) // 30
    })
```

---

### 使用案例

[MESS](https://mess.metalsheep.com/)

為通勤族精心設計的閱讀網站，你可以在任何等待時間使用任何裝置隨時閱讀國外媒體或文章，並享受精心設計的使用者介面與翻譯、語音服務。

---

### Versions

1.x與2.x的版本差異非常大，如果使用1.x請參照下列文件：

[Guide](https://khc-zhihao.github.io/MyBook/Packhouse/static/)

[API Document](https://khc-zhihao.github.io/Packhouse/old/document/document.html)
