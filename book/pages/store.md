# Store

雖然函數程式設計告訴我們函數得是無狀態的，但基本上這樣是有困難的對吧？

光是模組化設計就跑不掉關於環境變數的問題，Store就是為基礎狀態而生。

下列著個例子有一個取circumference(圓周)的例子，但這個例子求的圓周長並不精準。

```js
factory.join('math', {
    tools: {
        circumference: {
            action(r) {
                this.success(r * 2 * 3.14159)
            }
        }
    }
})
```

我們可以在加入Group時賦予一個options給它，它將在Group的Install中被接收。

```js
let group = {
    install(group, options) {
        group.pi = options.pi
    }
}
```

當Tool第一次宣告Action時能夠觸發Create的行為，這時咱們的主角`Store`就登場拉。

```js
group.tools = {
    circumference: {
        create(store, group) {
            store.pi = group.pi || 3.14159
        },
        action(r) {
            this.success(r * 2 * this.store.pi)
        }
    }
}
```

每一個Tool都會分配一個Store物件，他綁定了一些以`$`字號的系統物件，並可以在Action被存取。

> 更多的系統接口請參閱API Document。

```js
group.tools.doubleCircumference = {
    create(store) {
        store.getCircumference = store.$tool('circumference').action
    },
    action(r) {
        this.store.getCircumference(r, (err, result) => {
            this.success(result * 2)
        })
    }
}
```

最後在加入Group時藉由第三個參數把PI傳遞進去：

```js
factory.join('math', group, {
    pi: Math.PI
})
```