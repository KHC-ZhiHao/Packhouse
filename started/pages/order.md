# Order

Order的運用比較特別，基本上是應用在短時間內多個相同的請求時，只實質發出一個請求，直到資料回來再推播給所有訂閱者。

```js
let order = Packhouse.createOrder({
    // cache的容載量(預設為100)，當超過容載量後會移除最舊的cache後再加入最新的
    max: 100
})
```

## 基礎運用

這樣的Order非常不親民，有點違反最小知識原則，如果追求彈性再一個一個調適。

```js
factory.join('request', {
    tools: {
        request: {
            molds: ['string'],
            create(store) {
                store.order = Packhouse.createOrder()
            },
            action(query) {
                this.store.order
                    // 獲取Cache物件
                    .getOrCreate(key)
                    // 註冊一則成功或失敗的callback
                    .buffer(this.error, this.success)
                    // 如果這次推播結束後清空快取資料
                    .finish(cache => cache.clear())
                    // 如果Cache沒有資料則運行action
                    .action((error, success) => {
                        setTimeout(() => {
                            success('543')
                        }, 1000)
                    })
            }
        }
    }
})
```

## Use

Use是一個高階的API，把上面的例子做了一個簡單的包裝，這樣的Code就清爽多了。

```js
factory.join('request', {
    tools: {
        request: {
            molds: ['string'],
            create(store) {
                store.order = Packhouse.createOrder()
            },
            action(query) {
                this.store.order.use(query, this.error, this.success, (error, success) => {
                    setTimeout(() => { success('543') }, 1000)
                })
            }
        }
    }
})
```
