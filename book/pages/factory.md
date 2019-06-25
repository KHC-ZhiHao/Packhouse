# Factory

`Factory`是`Packhouse`最高群組單位，是`Group`的容器，也是最基本的對外接口。

```js
Packhouse.createFactory({
    bridge: function() {}
})
```

---

## Options

### Bridge

* function
* optional

當從`factory`呼叫`group`時，會先觸發`bridge`行為。

```js
let factory = Packhouse.createFactory({
    // Bridge可以用在動態加載Group
    bridge(factory, groupName, toolName) {
        if (factory.hasGroup(groupName) === false) {
            factory.addGroup(groupName, require(`../groups/${groupName}`))
        }
    }
})
```

---

## Group

```js
factory.addGroup('groupName', group)
```

### 移除Group

```js
factory.removeGroup('groupName')
```

### 呼叫Tool

```js
factory.tool('groupName', 'toolName').action(...)
```
### 呼叫Line

```js
factory.line('groupName', 'lineName')(...).action(...)
```
