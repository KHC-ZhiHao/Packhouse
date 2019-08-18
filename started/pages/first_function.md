# First Tool

Tool是PK的函數最小單位，如果沒有額外的設計，基本上就是呼叫一個function，本章節會大致上介紹建立Tool的參與腳色。

## 第一支function

這是我們一個普通到不行的加總function

```js
function sum(a, b) {
    return a + b
}
```

這是用`packhouse`建立的加總function

```js
let group = {
    tools: {
        sum: {
            action(a, b) {
                this.success(a + b)
            }
        }
    }
}
let factory = Packhouse.createFactory()
factory.join('math', group)
let sum = factory.tool('math', 'sum').action
```

是的，就是這麼複雜。

### Factory

Factory是整個架構的核心，Group必須向Factory註冊才有真正的功能。

### Group

Group是一個類別群組的分類，在同一個Group下的Function能夠想一些設定。

### Tool

Tool是Packhouse的基本單位，也是Function的載體，必須依附在Group下。

## Response

Tool在呼叫後能夠用三種方式回傳，所有的方法都允許非同步設計。

### Action

最後的參數必須回callback，在執行結束後呼叫

```js
sum.action(5, 8, (err, result) => {
    cosnole.log(result) // 13
})
```

### Promise

回傳一個promise

```js
sum.promise(5, 8).then((result) => {
    console.log(result) // 13
})
```

### Recursive

遞迴一個action

```js
sum.recursive(5, 8, (err, result, stack) => {
    if (result > 20) {
        console.log(result) // 23
    } else {
        stack(result, 10)
    }
})
```

## Success 與 Error

宣告這個函式為成功還是失敗，可以視為Promise的resolve與reject，會由this帶入，意味著不要使用箭頭函數使this指向錯誤。

```js
factory.join('math', {
    tools: {
        max20: {
            action(value) {
                if (value > 20) {
                    this.error('value must less 20.')
                } else {
                    this.success(true)
                }
            }
        }
    }
})
factory.tool('math', 'max20').promise(87).catch(e => console.log(e)) // value must less 20.
```

雖然你已經可以開始用Packhouse建構你的函示庫了，但這仍然只是整個系統的鳳毛麟角。
