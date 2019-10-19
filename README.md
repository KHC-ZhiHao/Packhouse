<p align="center"><img src="https://khc-zhihao.github.io/MyBook/Packhouse/images/logo.png"></p>

<p align="center" style="font-size:2em">Functional Programming Design Pattern</p>

<p align="center">
    <a href="https://www.npmjs.com/package/packhouse"><img src="https://img.shields.io/npm/v/packhouse.svg"></a>
    <a href="https://travis-ci.org/KHC-ZhiHao/Packhouse">
    <img src="https://travis-ci.org/KHC-ZhiHao/Packhouse.svg?branch=master" alt="travis-ci"  style="max-width:100%;">
    </a>
    <a href="https://coveralls.io/github/KHC-ZhiHao/Packhouse?branch=master">
        <img src="https://coveralls.io/repos/github/KHC-ZhiHao/Packhouse/badge.svg?branch=master" alt="Coverage Status"  style="max-width:100%;">
    </a>
    <a href="https://standardjs.com/">
        <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="Standard Code Style"  style="max-width:100%;">
    </a>
    <a href="https://lgtm.com/projects/g/KHC-ZhiHao/Packhouse/context:javascript"><img alt="Language grade: JavaScript" src="https://img.shields.io/lgtm/grade/javascript/g/KHC-ZhiHao/Packhouse.svg?logo=lgtm&logoWidth=18"/></a>
    <a href="https://github.com/KHC-ZhiHao/Packhouse"><img src="https://img.shields.io/github/stars/KHC-ZhiHao/Packhouse.svg?style=social"></a>
    <br>
</p>

<br>

## Summary

`Packhouse` is model based on Functional Programming. The goal is to use microservices in microservices, this library provides  powerful tracking and caching systems to build a good programming environment for FaaS services, such as AWS Lambda.

The software architecture is designed for the [Serverless Framework](https://serverless.com/), but `Packhouse` doesn't enforce the operating environment, it can even be executed in the browser.

This library does not fully follow the Functional Programming design paradigm, but please read the following article to understand the design concept of Functional Programming before you start.

[JS函數式編程指南(ZH)](https://yucj.gitbooks.io/mostly-adequate-guide-traditional-chinese/content/)

[中文讀我](./README_TW.md)

> 我英文能力不太靠譜，如果有錯誤請協助修正，感謝。

## Install

```bash
npm i packhouse --save
```

---

## Operating Environment

Node.js 8.x or higher is required.

---

## Table Of Contents

* [First Function](#First-Function)

* [Mold](#Mold)

* [Preprocessing](#Preprocessing)

* [Install](#Install)

* [Utils](#Utils)

* [Include](#Include)

* [Line](#Line)

<<<<<<< HEAD
* [Event and tracking](#Event-and-tracking)

* [Merger](#Merger)

* [Always new start](#Always-new-start)
=======
* [Event And Track](#Event-And-Track)

* [Merger](#Merger)

* [Always Restart](#Always-Restart)
>>>>>>> b3d79a7b900b8495c65500d09bc9cfdf25774698

* [Pulgin](#Pulgin)

* [Example](#Example)

<<<<<<< HEAD
* [Version iteration](#Version-iteration)
=======
* [Version Iteration](#Version-Iteration)
>>>>>>> b3d79a7b900b8495c65500d09bc9cfdf25774698

---

## First Function

```js
const Packhouse = require('packhouse')
/*
    Return applies to the interrupt function, but the return value is handled by this.success or this.error, so the arrow function cannot be used.
*/
let packhouse = new Packhouse()
let group = {
    tools: {
        sum: {
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
}

// Add group is use lazy loaded.
packhouse.add('math', () => {
    return {
        data: group
    }
})

packhouse.tool('math', 'sum').action(5, 10, (error, result) => {
    console.log(result) // 15
})
```

> `Tool` is the basic unit of the function, and the entire `Packhouse` system is based on the `Tool` construction.

### Action

The above example can be found that we use `Action` to call sum `Tool`, `Action` is Node callback design, the first parameter is error, next is result, if the internal function is not asynchronous, then it will be synchronous.

```js
let group = {
    tools: {
        sum: {
            handler(v1, v2) {
                if (typeof v1 + typeof v2 !== 'numbernumber') {
                    // Use the return interrupt program to execute.
                    return this.error('Param not a number.')
                }
                this.success(v1 + v2)
            }
        }
    }
}
packhouse.tool('math', 'sum').action(5, '10', (error, result) => {
    console.log(error) // Param not a number.
})
```

### Promise

Because success and error can be resolve and reject, which allows each of the `Tool` can to be promise.

> Although have two difference mode asynchronous and synchronous, the original meaning of `Packhouse` is to treat all functions as asynchronous.

```js
packhouse.tool('math', 'sum').promise(5, 10).then(r => console.log(r)) // 15
```

---

## Mold

Read `Mold` before, let's take a look at the design of the TypeScript:

```ts
// Basic function
function sum(v1: number, v2: number): number {
    return v1 + v2;
}

// Interface based
interface Person {
    firstName: string;
    lastName: string;
}

function greeter(person: Person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}
```

As above, `Mold` is responsible for processing the parameter structure, and the writing is as follows:

```js
let group = {
    tools: {
        sum: {
            request: ['number', 'number'],
            response: 'number',
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
}
packhouse.tool('math', 'sum').action(5, '10', (error, result) => {
    console.log(error) // Parameter 1 not a number(10).
})
```

`Packhouse` provides the basic `Mold` as follows:

```js
let group = {
    tools: {
        sum: {
            request: [
                // Type is reference to units.getType, so be sure to match "is" parameter.
                'type|is:string|abe',
                'boolean|abe',
                'number|max:0|min:0|abe',
                'int|max:0|min:0|abe',
                'string|abe',
                'array|abe',
                'buffer|abe',
                'object|abe',
                'function|abe',
                // In accordance with the format of Date.
                'date|abe',
                'required'
            ]
        }
    }
}
```

### Define Your Mold

The practice of Interface must be built alone `Mold`, which can be declaration in `Packhouse` to become the global `Mold` or only in the current `Group`.

> It is not recommended to directly declaration `Mold` in the whole domain. For related methods, please refer to `Merger`.。

```js
let packhouse = new Packhouse()
// Declaration in Packhouse.
packhouse.addMold('person', function(value, { index }) {
    if (typeof value === 'object' && typeof value.firstName === 'string' && typeof value.lastName === 'string') {
        // The computed of mold is based on synchronization, it will put the returned value into the param corresponding to the tool, which means that mold can also be used as the data conversion layer.
        return {
            firstName: value.firstName,
            lastName: value.lastName
        }
    }
    // If the data is wrong, use the throw keyword.
    throw new Error(`Parameter ${index} validate error.`)
})

// Declaration in group.
let group = {
    molds: {
        person(value, { index }) {
            // Define the same handler as above.
        }
    },
    tools: {
        greeter: {
            // If group has the same named mold, use group first.
            request: ['person'],
            handler(person) {
                this.success('Hello, ' + person.firstName + ' ' + person.lastName)
            }
        }
    }
}
```

### Use Null To Ignore Validation

```js
let group = {
    tools: {
        sum: {
            request: [null, 'number'],
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
}
```

### Use Casting To Mold In The Handler

```js
let group = {
    tools: {
        sum: {
            handler(v1, v2) {
                try {
                    v1 = this.casting('number', v1)
                    this.success(v1 + v2)
                } catch (error) {
                    this.error(error)
                } 
            }
        }
    }
}
```

### Mold Expression

Javascript allows you to preset parameter values, meaning that some parameters not a required, can giving abe(allow be empty) allows the parameter to be null or undefined.

```js
let group = {
    tools: {
        sum: {
            request: ['number', 'number|abe'],
            handler(v1, v2 = 0) {
                this.success(v1 + v2)
            }
        }
    }
}
```

### Custom Mold Expression

```js
let group = {
    molds: {
        person(value, { extras }) {
            if (!(extras.boy && value.sex === 'boy')) {
                throw new Error('Sex not a boy.')
            }
            if (extras.minAge && value.age < Number(extras.minAge)) {
                throw new Error(`Age less ${extras.minAge}`)
            }
            return value
        }
    },
    tools: {
        greeter: {
            request: ['person|minAge:18|boy'],
            handler(person) {
                this.success('Hello, ' + person.firstName + ' ' + person.lastName)
            }
        }
    }
}
```

---

## Preprocessing

The `Action` and `Promise` of `Tool` are an ending, and some pre-processing can be before invoke them.

### Pack

Add parameters in advance.

```js
packhouse
    .tool('math', 'sum')
    .pack(5)
    .action(10, (error, result) => {
        console.log(result) // 15
    })
```

### Repack

`Pack` continuous used will continue processed.

```js
packhouse
    .tool('math', 'sum')
    .pack(10, 20)
    .pack(30, 40)
    .action((error, result) => {
        console.log(result) // 30
    })
```

`Repack` will back to origin:

```js
packhouse
    .tool('math', 'sum')
    .pack(5)
    .pack(10)
    .repack(20, 30)
    .action((error, result) => {
        console.log(result) // 50
    })
```

### Weld

Bring the return value to another `Tool`, with `Pack` can to initial currying concept.

```js
packhouse
    .tool('math', 'sum')
    .pack(10, 20)
    .weld('double', (result, pack) => pack(result))
    .action((error, result) => {
        console.log(result) // 60
    })
```

### NoGood

It is failure callback.

> repeated registration will be replaced

```js
// If noGood is declared, the error of the action callback will be discarded.
packhouse
    .tool('math', 'sum')
    .noGood(error => {
        console.log(error) // Parameter 1 not a number(10).
    })
    .action(5, '10', (result) => {
        // no work
    })

// If the promise is to be declared reslove, this is something to be aware of.
packhouse
    .tool('math', 'sum')
    .noGood(error => {
        console.log(error) // Parameter 1 not a number(10).
    })
    .promise(5, '10')

// If the promise wants noGood to be declared at the same time and the use rejected, the second parameter as follows:
packhouse
    .tool('math', 'sum')
    .noGood(error => {
        console.log(error) // Parameter 1 not a number(10).
    }, {
        reject: true
    })
    .promise(5, '10')
```

### Always

This callback will be executed regardless of success or failure.

> Repeated registration will be replaced.

```js
packhouse
    .tool('math', 'sum')
    .always(result => {
        console.log(result) // 25
    })
    .action(5, 20, (error, result) => {
        console.log(result) // 25
    })
```

---

## Install

`Group` and `Tool`, `Line` have the stage of `Install`, as the name suggests is the method that will be called when the first execution.

```js
let group = {
    // Options is the interface for exchanging data.
    install(group, options) {
        console.log(options.demo) // hello
    },
    tools: {
        myTool: {
            install(context) {
                // ...
            }
        }
    }
}

packhouse.add('demo', () => {
    return {
        data: group,
        options: {
            demo: 'hello'
        }
    }
})
```

### Group

The `Group` object can be read in `Install`:

```js
let group = {
    install(group, { demo }) {
        group.name = '123'
    },
    tools: {
        myTool: {
            install({ group }) {
                console.log(group.name) // '123'
            }
        }
    }
}
```

### Store

The `Store` object will be bound to this in the `Tool Handler`.

```js
let group = {
    install(group) {
        group.name = '123'
    },
    tools: {
        myTool: {
            install({ store, group }) {
                // This is tool and group transaction data.
                store.name = group.name
            },
            handler() {
                console.log(this.store.name) // name
            }
        }
    }
}
```

---

## Utils

`Utils` provides extensions and generics methods.

```js
let Packhouse = require('packhouse')
let packhouse = new Packhouse()
console.log(packhouse.utils.generateId()) // uuid
```

### Use utils in handler

```js
let group = {
    tools: {
        myTool: {
            install({ store, utils }) {
                store.id = utils.generateId()
            },
            handler() {
                console.log(this.store.id) // uuid
            }
        }
    }
}
```

### Use Utils In Mold

```js
let group = {
    molds: {
        generateId(value, { utils }) {
            return utils.generateId()
        }
    }
}
```

### Methods

#### getType

```js
packhouse.utils.getType([]) // array
packhouse.utils.getType(NaN) // NaN
packhouse.utils.getType(null) // empty
packhouse.utils.getType(undefined) // empty
packhouse.utils.getType(/test/) // regexp
packhouse.utils.getType(new Promise(() => {})) // promise
packhouse.utils.getType(Buffer.from('123')) // buffer
packhouse.utils.getType(new Error()) // error
```

#### verify

```js
let options = {
    a: 5,
    b: []
}
let data = packhouse.utils.verify(options, {
    a: [true, ['number']], // [required, allow types, default value]
    b: [true, ['array']],
    c: [false, ['number'], 0]
})
console.log(data.a) // 5
console.log(data.c) // 0
```

#### generateId

Generate a similar uuid random strings.

```js
let id = packhouse.utils.generateId()
```

#### arrayCopy

Basically it is the function of array.slice(), but it to faster.

```js
let newArray = packhouse.utils.arrayCopy([])
```

#### peel

The value of the specified path object is available, if not found return undefined.

```js
let a = {
    b: {
        c: {
            d: 5
        }
    }
}
console.log(packhouse.utils.peel(a, 'b.c.d')) // 5
```

---

## Include

Use other `Tool` and even with other `Group` methods.

> Deep tiered traces registered context Must be via include.

```js
let group = {
    tools: {
        sum: {
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        },
        sumAndDouble: {
            install({ include }) {
                // First give name, and select the object.
                include('sum').tool('sum')
            },
            handler(v1, v2) {
                // Use "use" keyword invoke tool.
                this.use('sum')
                    .noGood(this.error)
                    .action(result => {
                        this.success(result * 2)
                    })
            }
        }
    }
}
```

### More Include Methods

```js
let group2 = {
    tools: {
        sum: {
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
}
let group = {
    // Merges is a renamed reference interface, which is mainly used to join the required groups.
    mergers: {
        'useGroup': 'group2'
    },
    tools: {
        sum: {
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        },
        sumAndDouble: {
            install({ include }) {
                // Preprocessing the tool.
                include('sum').tool('sum').pack(10)
                // Use line,line does not return any value, so it cannot be preprocessed.
                include('math').line('math')
                // Use coop to import other groups.
                include('sum2').coop('useGroup', 'tool', 'sum').pack(10)
            },
            handler() {
                // ...
            }
        }
    }
}

packhouse.add('group', () => {
    return {
        data: group
    }
})

packhouse.add('group2', () => {
    return {
        data: group2
    }
})
```

---

## Line

`Line` is the result of the set of all the above knowledge, and is the standard model of the Curry Function of `Packhouse`.

```js
let group = {
    tools: {
        sum: {
            handler(v1, v2) {
                this.success(v1 + v2)
            }
        }
    }
    lines: {
        math: {
            request: ['number'],
            response: 'number',
            install({ include }) {
                // From input to output share "this" state.
                include('sum').tool('sum')
            },
            input(value) {
                // Success in the Line except for output does not transfer value, but passes directly through the store.
                this.store.value = value
                this.success()
            },
            output() {
                this.success(this.store.value)
            },
            layout: {
                // Layout is a simple tool groups.
                add: {
                    request: ['number'],
                    handler(value) {
                        this.use('sum')
                            .noGood(this.error)
                            .action(this.store.value, value, result => {
                                this.store.value = result
                                this.success()
                            })
                    }
                },
                double: {
                    handler(value) {
                        this.store.value *= 2
                        this.success()
                    }
                }
            }
        }
    }
}

packhouse.line('groupName', 'math')(10).add(5).add(15).double().action((error, result) => {
    console.log(result) // 60
})
```

---

## Event And Track

`Packhouse` does a lot of wrapping for the function, all in order to track the running process, which also make `Packhouse` not suitable for intensive calculations, I have to admit that it is very slow when to `Tool` invoke `Tool`, if you mind The difference between the millisecond.

```js
let Packhouse = require('packhouse')
let packhouse = new Packhouse()

// Triggered whenever only group is used.
packhouse.on('run', (event, { type, name, group })) => {})

// Whenever the tool is triggered, the context of the call can be known by the current id and caller.
packhouse.on('run', (event, { id, caller, detail })) => {})

// Triggered when the end tool ending.
packhouse.on('done', (event, { id, caller, detail })) => {})
```

### Off Listener

Each call to `on` will get a id, which can be off listener by:

```js
let id = packhouse.on('run', () => {})
packhouse.off('run', id)
```

Also possible to cancel the listen by the first argument of the callback:

```js
packhouse.on('run', (event) => {
    event.off()
})
```

---

## Merger

Sometimes we will use the repository to packed service. The `Merger` is born for this. Whenever the external reference to `Merger` is required, the namespace must be added, but it is not needed for internal use.

```js
let merger = {
    molds: {
        myMold() {
            // mold code
        }
    },
    groups: {
        myGroup() {
            return {
                data: {
                    tools: {
                        myTool: {
                            handler() {
                                // do something...
                            }
                        }
                    }
                }
            }
        }
    }
}
// Namespace separated by @.
packhouse.merger('firstMerger', merger)
packhouse.tool('firstMerger@myGroup', 'myTool').action(() => {
    // ...
})
```

---

## AWS Promise With Error

Although all methods of the AWS SDK provide a promise interface, its has a bad problem. If there is a code error when certain stack call, the promise will catch the error but not trigger catch().

```js
// Use native error handling to avoid test failure.
let AWS = require('aws-sdk')
let client = new AWS.DynamoDB.DocumentClient()
let group = {
    tools: {
        getUser: {
            handler(name) {
                let parmas = {
                    TableName: 'users',
                    Key: {
                        name
                    }
                }
                client.get(params, (err, result) => {
                    if (err) {
                        this.error(err)
                    } else {
                        this.success(result)
                    }
                })
                // Avoid the following announcement:
                client.get(params).promise()
            }
        }
    }
}
```

---

## Always Restart

Node's require method has a catch feature, unless you manually clear it, it will cache the last use. This is high-risk in Functional Programming. Please initialization behaviors are written in install, but the means that of the install will not be re-worked after instantiating `Packhouse`, so each request process must re-instantiate `Packhouse`. Here is an example of AWS Lambda:

### Bad Pattern

```js
let AWS = requrie('aws-sdk')
let Packhouse = require('packhouse')

let client = new AWS.DynamoDB.DocumentClient()
let packhouse = new Packhouse()

packhouse.add('db', () => {
    return {
        tools: {
            get: {
                handler() {
                    client.get({ ... }, () => { ... })
                }
            }
        }
    }
})

exports.handler = async () => {
    packhouse.tool('db', 'get').action((() => { ... })
}
```

---

### Good Pattern

```js
let AWS = requrie('aws-sdk')
let Packhouse = require('packhouse')

exports.handler = async () => {
    let packhouse = new Packhouse()
    packhouse.add('db', () => {
        return {
            install(group) {
                group.client = new AWS.DynamoDB.DocumentClient()
            },
            tools: {
                get: {
                    install({ group, store }) {
                        store.client = group.client
                    },
                    handler() {
                        this.store.client.get({ ... }, () => { ... })
                    }
                }
            }
        }
    })
    // begin your code...
}
```

---

## Pulgin

You can use `Pulgin` to extend the method of `Packhouse`.

```js
let Packhouse = require('packhouse')
let packhouse = new Packhouse()

class MyFirstPulgin {
    constructor(packhouse, options) {
        // do something...
    }
}

packhouse.plugin(MyFirstPulgin)
```

### Order

`Order` is a cache object that deals with the same conditional intensive request for a short period of time.

Before the result of the first request comes back, all subsequent requests will wait for the result of the first request backhaul.

> In Functional Programming, it is common to send several requests to the same condition, because we have to treat each request as a new service, even if the key values are the same, but this means unnecessary performance waste.

```js
let Packhouse = require('packhouse')
let Order = require('packhouse/plugins/Order')
let packhouse = new Packhouse()

packhouse.plugin(Order)

let group = {
    tools: {
        sum: {
            install({ store, utils }) {
                // order bound on utils.
                store.order = utils.order()
            },
            handler(v1, v2) {
                // key, { success, error }, callback
                this.store
                    .order
                    .use(v1 + '+' + v2, this, (error, success) => {
                        success(v1 + v2)
                    })
            }
        }
    }
}

packhouse.add('math', () => {
    return {
        data: group
    }
})

packhouse.tool('math', 'sum').action(10, 20, (error, result) => {
    console.log(result) // 30
})
```

---

### Step

`Step` can make `Packhouse` to serve as the frameworke and construct the entire service.

```js
let Packhouse = require('packhouse')
let Step = require('packhouse/plugins/Step')
let packhouse = new Packhouse()

// After the step is used, can use step method in packhouse, and a promise is returned after the announcement.
packhouse.plugin(Step)
packhouse.step({
    create: function() {
        // Since this is shared, create can support register this.
        this.result = 0
    },
    middle: function({ exit, fail }) {
        // You can set the jump condition between templates.
        if (this.result > 10) {
            exit()
        }
    },
    timeout: 25000, // ms
    output({ timeout, history, fail, message }, success) {
        console.log(fail) // True if fail is declared.
        console.log(message) // Exit or fail to carry the message.
        console.log(timeout) // If it is timeout, it will be true.
        console.log(history.toJSON()) // Step will help you build the tracking process and output details.
        success(this.result)
    },
    template: [
        function(next, { exit, fail }) {
            this.result = 10
            next()
        }
        // Your logic.
    ]
}).then(result => console.log(result)) // 10
```

---

## Example

This example how `Packhouse` combs the complex "Taiwan meteorological open data near latitude and longitude" to an easy-to-read process, and fully summarizes the models `Group` and `Merger`. However real business logic is complex more than this.

You can clone this project and package example folder to zip and upload it to AWS Lambda, Paste the following event and set timeout to 30 seconds with calling before:

> Remember install node_modules

```json
{
  "latitude": 25.0419392,
  "longitude": 121.5459295
}
```

---

## Version Iteration

The re-examination of the architecture between 1.1.6 and 1.1.7 is therefore quite different.

The file about 1.1.6 is as follows:

[Guide](https://khc-zhihao.github.io/MyBook/Packhouse/static/)

[API Document](https://khc-zhihao.github.io/Packhouse/old/document/document.html)
