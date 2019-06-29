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

## Functional Programming

開始前可以閱讀下列文章，函數式程式設計的法則將能夠協助避開地雷。

>[JS函數式編程指南](https://yucj.gitbooks.io/mostly-adequate-guide-traditional-chinese/content/)或許可以提供幫助。
