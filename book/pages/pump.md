# Pump

一個計數器，為推送多筆非同步請求而生。

```js
let pump = Packhouse.createPump(10, callback)
```

---

## 方法

### Press

呼叫即計數+1，由上方例子代表呼叫10次`Press`即呼叫`callback`。

```js
pump.press()
```

### Add

再加一點目標，或很多，意味著你必須宣告更多次的`Press`。

```js
pump.add() // 同pump.add(1)
pump.add(3)
```

### Each

直接依照目標計數次數迭代。

> 注意不是從0開始，並不會宣告之前已經宣告`Press`的事件。

```js
// count 為當前計數的數字
pump.each((press, count) => {
    // do something...
    press()
})
```
