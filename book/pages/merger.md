# Merger

Merger是一個模組化接口，其實就是一個mold與group集，只是會加上前墜。

```js
factory.merger('aws', {
    molds: {
        isObject: {
            check(value) {
                return typeof value === 'object' ? true : 'Not a object'
            }
        }
    },
    groups: {
        ddb: {
            install(group, options) {
                let AWS = require('aws-sdk')
                AWS.config.update({region: options.region})
                group.client = new AWS.DynamoDB.DocumentClient()
            },
            tools: {
                put: {
                    // 內部引用有命名空間
                    molds: ['isObject'],
                    action(param) {
                        this.store.$group.client.put(param, this.success)
                    }
                }
            }
        }
    }
}, {
    region: 'us-east-1'
})
```

引用必須要以name和@標籤：

```js
factory.tool('aws@ddb', 'put').action({
    TableName : 'Table',
    Item: {
        HashKey: 'haskey',
    }
}, (err, result) => {
    consolo.log(result) // { ... }
})
```
