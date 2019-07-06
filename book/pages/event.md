# Event

Factory可以監聽一些指定流程，並獲取上下文。

```js
factory.on('success', (context) => { console.log(context.result) })
factory.tool('math', 'sum').promise(5, 5)
// log: 10
```

目前提供的事件有：

* error
* success
* use-before
* action-tool-before
* action-line-before

## 高階應用

`use-before`是在Factory呼叫Tool或Line前觸發的事件，意味著我們可以實行懶加載：

> 在非箭頭函數的情況下，this指向factory

```js
factory.on('use-before', function({ groupName }) {
    if (this.hasGroup(groupName) === false) {
        this.addGroup(groupName, require('./' + groupName))
    }
})
```
