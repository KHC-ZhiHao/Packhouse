<p align="center"><img src="https://khc-zhihao.github.io/MyBook/Packhouse/images/logo.png"></p>

<p align="center" style="font-size:2em">Functional Programming Library</p>
<p align="center">
    <a href="https://www.npmjs.com/package/packhouse"><img src="https://img.shields.io/npm/v/packhouse.svg"></a>
    <a href="https://github.com/KHC-ZhiHao/Packhouse"><img src="https://img.shields.io/github/stars/KHC-ZhiHao/Packhouse.svg?style=social"></a>
    <br>
</p>

---

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

## 開始 (How to use?)

[教學文件 (base gitbook)](https://khc-zhihao.github.io/MyBook/Packhouse/static/)

## 文件

[版本日誌](https://khc-zhihao.github.io/Packhouse/document/version)

[開發者文件](https://khc-zhihao.github.io/Packhouse/document/document.html)

[npm-image]: https://img.shields.io/npm/v/packhouse.svg
[npm-url]: https://npmjs.org/package/packhouse