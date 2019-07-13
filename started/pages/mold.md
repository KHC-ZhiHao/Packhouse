# Mold

TypeScript的函數設計提供了我們良好的設計模式，可以指定參數的型態可以少掉很多程式碼的編輯。

```ts
function sum(a: number, b:number): number {
    return a + b
}
```

Mold可以定義參數型態：

```js
factory.join('math', {
    molds: {
        number: {
            check(value, context) {
                // 回傳true之外的狀態都視為失敗
                return typeof value === 'number' ? true : `Param(${context.index}) not a number`
            }
        }
    }
    tools: {
        sum: {
            molds: ['number', 'number'],
            action(a, b) {
                this.success(a + b)
            }
        }
    }
})
```

在錯誤的驗證下會從Error中被擲出：

```js
factory.tool('math', 'sum').action(5, '3', (err, result) => {
    console.log(err) // Param(1) not a number
})
```

## 型態轉換

當Mold驗證通過後，可以藉由Casting行為轉換參數的模樣。

```js
factory.join('math', {
    molds: {
        int: {
            check(value) {
                return typeof value === 'number' ? true : 'Not a number'
            },
            casting(value) {
                return Math.floor(value)
            }
        }
    }
    tools: {
        floor: {
            molds: ['int'],
            action(value) {
                this.success(value)
            }
        }
    }
})
factory.tool('math', 'floor').action(5.487, (err, result) => {
    console.log(result) // 5
})
```

## 額外參數(extras)

check的context除了可以獲取index和caller外，還可以獲取使用|符號建立的額外參數：

```js
factory.join('math', {
    molds: {
        max: {
            check(value, context) {
                let max = Number(context.extras[0])
                return value < max ? true : `Need less ${max}`
            }
        }
    }
    tools: {
        floor: {
            molds: ['max|20'],
            action(value) {
                this.success(value)
            }
        }
    }
})
```

## Factory Mold

像是Number這麼常見的驗證方法，必須在每個Group上宣告是不是太麻煩了？

我們可以把它註冊在Factory上：

```js
factory.addMold('number', {
    check(value, context) {
        return typeof value === 'number' ? true : `Param(${context.index}) not a number`
    }
})
```

這樣就可以在每個Group中被使用。

> 當Group中有相同名稱的Mold，以Group優先。

```js
factory.join('math', {
    tools: {
        sum: {
            molds: ['number', 'number'],
            action(a, b) {
                this.success(a + b)
            }
        }
    }
})
```

### System Mold

當你照上面的例子操作，馬上會有`Name(number) already exists.`的錯誤印在你臉上。

主因來自當Factory被建立時，就會同步以下幾個Mold：

* number: 驗證是否為數字
* int: 驗證是否為數字並轉成整數
* boolean : 驗證是否為布林值
* string: 驗證是否為字串
* array: 驗證是否為陣列
* object: 驗證是否為物件
* function: 驗證是否為函數
* required: 驗證參數不能為空

以上的Public Mold都能接收一項abe(Allowed be empty)的參數，允許參數為空。

```js
factory.join('math', {
    tools: {
        sum: {
            molds: ['number|abe', 'number'],
            action(a = 0, b) {
                this.success(a + b)
            }
        }
    }
})
```