<br>

<p align="center"><img src="./logo.png"></p>

<p align="center" style="font-size:2em">View Model Library</p>

<p align="center">
    <a href="https://www.npmjs.com/package/alas"><img src="https://img.shields.io/npm/v/alas.svg"></a>
    <a href="https://travis-ci.org/KHC-ZhiHao/Alas">
    <img src="https://travis-ci.org/KHC-ZhiHao/Alas.svg?branch=master" alt="travis-ci"  style="max-width:100%;">
    </a>
    <a href="https://coveralls.io/github/KHC-ZhiHao/Alas?branch=master">
        <img src="https://coveralls.io/repos/github/KHC-ZhiHao/Alas/badge.svg?branch=master" alt="Coverage Status"  style="max-width:100%;">
    </a>
    <a href="https://standardjs.com/">
        <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard Code Style"  style="max-width:100%;">
    </a>
    <a href="https://github.com/KHC-ZhiHao/Alas"><img src="https://img.shields.io/github/stars/KHC-ZhiHao/Alas.svg?style=social"></a>
    <br>
</p>

<br>

## Summary

[教學與文件](https://alas-doc.metalsheep.com/)

#### 為了UI/UX而生

具有諸多的內置方法與事件都是為了優化流程而設計的。

#### 重構與優化程式碼

可以有效地建立資料結構讓開發人員不需要花太多時間驗證資料正確與否。

#### 單元測試

Alas試圖降低耦合，促使前端可以獨立進行單元測試。

#### 語系與規則的自我管理

以Container為主的擴展方式可以將Model快速的遷移至各種專案。

#### 為Vue.js進行優化

Alas可以說是Vue開發的經驗總結，雖然該Library不需要運行於其中，但可以說已經盡可能的針對Vue雙向綁定事件進行處理。

---

### 安裝

```bash
npm i alas --save
```

---

### 第一隻Model

```js
import Alas from 'alas'
import Ms from 'alas/packages/ms'

let alas = new Alas()

alas.addPackage(Ms)
alas.addContainer('user', {
    models: {
        user: {
            body: {
                name: ['#ms.type | is: string']
            }
        }
    }
})

let user = alas.make('user', 'user').$init({
    name: 'dave'
})

console.log(user.name) // dave
```

### 特色

#### 規範設計模型

規範每個模型的結構與定義入口，統一管理後不必再猜測每個對象生成時會是什麼模樣，而來源是什麼。

```js
let model = {
    body: {
        user: ['#ms.type | is: string']
    }
}
```

#### 重複編寫與煩雜的繼承樹

經由Alas生成的模型都具有各種時用的方法，低耦合高內聚的設計，捨棄JS的Class設計可以避免每個人的書寫風格不同造成的維護困難。

```js
class User {
    constructor(name) {
        this.name = name
        this.oriName = name
    }
    
    isChange() {
        return this.name !== this.oriName
    }
}

let user = new User('dave')

user.name = 'sum'

console.log(user.isChange()) // true
```

使用Alsa：

```js
let user = alas.make('user', 'user').$init({
    name: 'dave'
})

user.name = 'sum'

console.log(user.$isChange()) // true
```

#### 自我狀態管理

身為View Model Library，狀態管理是必要的，以async系統為主的Loader、Event等都能讓你的互動
介面達到最佳化。

```js
let user = alas.make('user', 'user')

user.$on('$ready', () => {
    console.log(user.$o.fetch.loading) // false
})

user.$o.fetch('dave')

console.log(user.$o.fetch.loading) // true
```

---

### Other

[Version Log](https://github.com/KHC-ZhiHao/Alas/blob/master/version.md)