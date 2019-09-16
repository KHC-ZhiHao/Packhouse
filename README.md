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

## Summary

<br>

## Cloud Function

<br>

## Functional Programming

雖然Packhouse不是那麼遵守函數式程式設計典範，但還是請您開始前可以閱讀下列文章了解`FP`的設計觀念。

[JS函數式編程指南](https://yucj.gitbooks.io/mostly-adequate-guide-traditional-chinese/content/)

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

## Document

[Guide](https://khc-zhihao.github.io/Packhouse/guide)

[Version](https://khc-zhihao.github.io/Packhouse/version)

<br>

## 運行環境

Node 8.1以上。

要運行在瀏覽器也可以，但本庫在編寫時不會考慮瀏覽器相容性。

<br>

## 版本迭代

1.1.6與1.1.7發生了重大變革，大幅降低了使用所需的知識門檻與正規化模組，但相對的兩版本的相容性趨近於０。

關於1.1.6版文件如下：

[Guide](https://khc-zhihao.github.io/MyBook/Packhouse/static/)

[API Document](https://khc-zhihao.github.io/Packhouse/old/document/document.html)