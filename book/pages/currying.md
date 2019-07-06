# Currying

Currying是函數式程式設計的一個指標，Packhouse使用`line`建構：

> 建構line是一個可歌可泣的旅程，繁雜又難懂，但前人種樹後人乘涼嘛。

```js
factory.join('math', {
    lines: {
        'compute': {
            // 觸發input時的mold
            molds: ['number'],
            input(value) {
                this.store.target = value
                // 在line中所有對象都公用同一支store，success由僅作為next的作用
                // 但error仍然會無視剩下的結果擲出錯誤
                this.success()
            },
            output() {
                // output的success具有真的擲出的功能
                this.success(this.store.target)
            },
            // layout支援兩種書寫模式，基本上就是tool的原型
            layout: {
                add(value) {
                    this.store.target += value
                    this.success()
                },
                double: {
                    molds: ['number'],
                    action() {
                        this.store.target *= 2
                        this.success()
                    }
                }
            }
        }
    }
})
factory.line('math', 'compute')(10).add(5).double().double().action((err, result) => {
    console.log(result) // 60
})
```

## Rule

跟tool不同的是，rule是line唯一預處理，也是layout保留字之一。

> 保留字還有action, promise

```js
factory.line('math', 'compute')('10').rule(() => console.log('error')).double().promise() // error
```

## Response

雖然Line是基於Tool驅動，但實質上的結構有很大的不同，所有的Response只負責最終結果的處裡。

> Line不支援Recursive
