# Group

Group是`Tool`、`Mold`、`Line`的集合，目的是讓`Packhouse`可分類與套件化，是所有流程的第一步，並可以接收一些對外部的數據。

```js
let coop = Packhouse.createGroup()
let math = Packhouse.createGroup({
    alias: 'math',
    module: false,
    secure: true,
    merger: {
        coop: coop,
        coop2: () => coop // 實現懶加載
    },
    create: function(options) {
        this.foo = 'bar'
    }
})
```

---

## Options

### Alias

* string
* optional

因為`Group`本身是沒有帶名字的，但在堆疊的追蹤上會以匿名函數出現，`Alias`就是為了有可視的Function Name而生。

有`Alias`的`Group`，可以看見 Alias_ToolName_ActionName，例如：math_double_direct：

```
Uncaught TypeError: some error
    at [math_double_direct] (<anonymous>:1228:24)
```

沒有`Alias`則以no_alias_group取代：

```
Uncaught TypeError: some error
    at [no_alias_group_double_direct] (<anonymous>:1228:24)
```

### Create

* function
* optional

在初始化`Group`的過程中會被呼叫，並以`this`建立自己的屬性，可被底下的`Tool`給讀取。

> 注意create不要使用箭頭函數，這會導致this指向錯誤。

```js
math.addTool({
    name: 'getFoo',
    action(system, error, success) {
        console.log(system.group.foo) //bar
    }
})
```

### Module

* boolean
* optional

宣告`alone`的`group`仍然可以被`factory`使用，但需要注意的是當宣告`alone`或引用至`factory`都只會觸發一次`create`的行為，此時`create`的`options`只會接受第一次被宣告的狀態，這樣會導致整個系統引用混亂。

`Module`的目的就是為了防止錯誤引用，宣告為`true`後該`Group`不能進入`factory`也不接受`optnios`。

### Secure

* boolean
* optional

建立安全模式，在安全模式下不會允許`tool`更改group的參數。

```js
math.addTool({
    name: 'secure',
    action(system, error, success) {
        system.group.foo = 'foo' // 報錯
    }
})
```

### Merger

* object
* optional

`Merger`是一個引用另一個`Group`的接口。

> 你可以直接傳入Group或是藉由一個function回傳Group，後者可以避免一些沒有使用到卻加載的情形。

```js
coop.addTool({
    name: 'multiply',
    action(number, coefficient, system, error, success) {
        success(number * coefficient)
    }
})

math.addTool({
    name: 'double',
    action(number, system, error, success) {
        success(system.coop('coop').tool('multiply').direct(number, 2))
    }
})
```

### Alone

基本上`group`是由`factory`驅動的，但`group`仍可以藉由`alone`獨立運行。

```js
let alone = math.alone()
console.log(alone.tool('double').direct(10)) // 20
```

---

## 創造

大多數的功能都是由`group`所創建的，創建方法如下：

### Tool

```js
group.addTool(options)
group.addTool(name, () => { return options }) //lazy
group.addTools([options, options, ...])
group.addTools({name: optnios, name2: options, ...})
```

### Mold

```js
group.addMold(options)
group.addMolds([options, options, ...])
group.addMolds({name: optnios, name2: options, ...})
group.addMolds({name: () => { return optnios }, name2: () => { return optnios }, ...}) // lazy
```

### Line

```js
group.addLine(options)
group.addLine(name, () => { return options }) //lazy
group.addLines([options, options, ...])
group.addLines({name: optnios, name2: options, ...})
group.addLines({name: () => { return optnios }, name2: () => { return optnios }, ...}) // lazy
```

---

## Profile 🔬

可以獲取`Group`的細節，或許用於建立測試與文件的接口。

> 目前為測試功能，內部狀態可能會改變。

```js
group.getProfile()
```