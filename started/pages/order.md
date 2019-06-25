# Order

一個用Key鍵建立可緩衝與快取的物件。

```js
let order = Packhouse.createOrder({
    max: 1000
})
```

---

## Options

### Max

* number
* default: 1000
* optional

cache的容載量，當超過容載量後會移除最舊的cache後再加入最新的，防止記憶體炸開。

---

## Get or Create

獲得一個快取物件，如果沒有則建立。

```js
let key = 'myFirstCache'
let cache = order.getOrCreate(key)
```

---

## Clear and Remove

指定移除某個快取物件

```js
order.remove('myFirstCache')
```

清空快取物件

```js
order.clear()
```

---

## Cache

order是一個快取物件的管理器，cache才是本體。

```js
let cache = order.getOrCreate('newCache')
```

### Onload

當該cache被賦予值後會呼叫onload，如果該chcae已經被賦值，那會直接呼叫callback。

```js
cache.onload((cache) => {
    cache.post()
})
```

### Buffer

加入一則buffer等待cache被賦值。

```js
let error = (m) => { console.error(m) }
let success = (m) => { console.log(m) }
cache.buffer(error, success)
```

### Post

推播給所有的buffer結果。

```js
cache.post()
```

### Is Ready

可以用isReady得知是否有賦值的狀態。

```js
cache.isReady() // true or false
```

### On Ready

onReady是一個賦值的接口，當宣告error或success代表被賦值型態與結果。

```js
cache.onReady((error, success) => {
    success('success')
})
```

---

## 基本技巧

```js
group.addTool({
    name: 'getVector'
    create: function() {
        this.arc = PI = Math.PI / 180
        this.order = Packhouse.createOrder()
    },
    action: function(angle, distance, system, error, success) {
        let key = angle.toString() + distance
        this.order
            .getOrCreate(key)
            .buffer(error, success)
            .onload(cache => cache.post())
            .onReady((error, success) => {
                let v = angle * this.arc
                success({
                    x : distance * Math.cos(v),
                    y : distance * Math.sin(v)
                })
            })
    }
})
```