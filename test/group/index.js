module.exports = {
    install(group, options) {
        group.test = options.test
    },
    mergers: {
        dynamoDB: 'aws@dynamoDB'
    },
    molds: {
        isTenAndToString(value) {
            if (value === 10) {
                return value.toString()
            } else {
                throw new Error('Error')
            }
        }
    },
    tools: {
        sum: {
            request: ['number', 'number'],
            handler(value1, value2) {
                this.success(value1 + value2)
            }
        },
        responseTest: {
            request: ['number', 'number'],
            response: 'int',
            handler(value1, value2) {
                this.success(value1 + value2)
            }
        },
        get: {
            request: ['string'],
            install({ include }) {
                include('get').coop('dynamoDB', 'tool', 'get').pack('a')
            },
            handler(name) {
                this.use('get')
                    .noGood(this.error)
                    .action(name, this.success)
            }
        },
        coopLine: {
            install({ include }) {
                include('query').coop('dynamoDB', 'line', 'query')
            },
            handler(name) {
                this.use('query')(name)
                    .get('123')
                    .action((err, result) => {
                        this.success(result)
                    })
            }
        },
        toolCantReturn: {
            install({ include }) {
                include('query').line('math').action(() => {})
            },
            handler() {
                this.success()
            }
        },
        moldTest: {
            request: ['type|is:string', 'type|is:number', 'string', 'number', 'boolean', 'array', 'buffer', 'object', 'function', 'date', 'required'],
            handler() {
                this.success(true)
            }
        },
        moldTestForDate: {
            request: ['date'],
            handler() {
                this.success(true)
            }
        },
        moldTestForRequired: {
            request: ['required'],
            handler() {
                this.success(true)
            }
        },
        moldTestForNumber: {
            request: ['number|min:10|max:20'],
            handler() {
                this.success(true)
            }
        },
        moldTestForInt: {
            request: ['int|min:10|max:20'],
            handler() {
                this.success(true)
            }
        },
        moldTestAndNull: {
            request: [null, 'string'],
            handler() {
                this.success(true)
            }
        },
        moldTestAndResponse: {
            response: 'number',
            handler(value) {
                this.success(value)
            }
        },
        moldTypeTest: {
            request: ['type|is:string', 'type|abe'],
            handler() {
                this.success(true)
            }
        },
        moldAbeTest: {
            request: ['string|abe', 'number|abe', 'boolean|abe', 'int|abe', 'array|abe', 'buffer|abe', 'object|abe', 'function|abe', 'date|abe'],
            handler() {
                this.success(true)
            }
        },
        moldCasting: {
            request: ['int'],
            handler(number) {
                this.success(number)
            }
        },
        customMold: {
            request: ['isTenAndToString'],
            handler(string) {
                this.success(string)
            }
        },
        storeTest: {
            install({ store }) {
                store.result = 'test'
            },
            handler() {
                this.success(this.store.result)
            }
        },
        includeTest: {
            install({ include }) {
                include('sum').tool('sum')
            },
            handler(value1, value2) {
                this.use('sum')
                    .action(value1, value2, (e, r) => {
                        this.success(r)
                    })
            }
        },
        groupTest: {
            install({ store, group }) {
                store.test = group.test
            },
            handler() {
                this.success(this.store.test)
            }
        },
        handlerCasting: {
            handler(value) {
                try {
                    this.success(this.casting('isTenAndToString', value))
                } catch (e) {
                    this.error(e)
                }
            }
        },
        utilsTest: {
            install({ store, utils }) {
                store.getType = utils.getType
            },
            handler(value) {
                this.success(this.store.getType(value))
            }
        },
        orderTest: {
            install({ store, utils }) {
                store.order = utils.order()
            },
            handler(name) {
                this.store
                    .order
                    .getOrCreat(name)
                    .buffer(this)
                    .action((error, success) => {
                        setTimeout(() => {
                            success(name)
                        }, 100)
                    })
            }
        },
        orderTestForUse: {
            install({ store, utils }) {
                store.order = utils.order()
            },
            handler(name) {
                this.store
                    .order
                    .use(name, this, (error, success) => {
                        setTimeout(() => {
                            success(name)
                        }, 100)
                    })
            }
        },
        orderTestLite: {
            install({ store, utils }) {
                store.order = utils.order()
            },
            handler(name) {
                this.store
                    .order
                    .use(name, this, (error, success) => {
                        success(name)
                    })
            }
        },
        orderTestForUseAndError: {
            install({ store, utils }) {
                store.order = utils.order()
            },
            handler(name) {
                this.store
                    .order
                    .use(name, this, (error) => {
                        setTimeout(() => {
                            error(name)
                        }, 100)
                    })
            }
        }
    },
    lines: {
        outputError: {
            input() {
                this.success()
            },
            output() {
                this.error('test')
            },
            layout: {}
        },
        mathResponse: {
            request: ['number'],
            response: 'int',
            input(value) {
                this.store.value = value
                this.success()
            },
            output() {
                this.success(this.store.value)
            },
            layout: {
                add: {
                    request: ['number'],
                    handler(value) {
                        this.store.value += value
                        this.success()
                    }
                }
            }
        },
        math: {
            request: ['number'],
            install({ include }) {
                include('sum').tool('sum')
            },
            input(value) {
                this.store.value = value
                this.success()
            },
            output() {
                this.success(this.store.value)
            },
            layout: {
                add: {
                    request: ['number'],
                    handler(value) {
                        this.use('sum')
                            .action(this.store.value, value, () => {
                                this.store.value += value
                                this.success()
                            })
                    }
                },
                double: {
                    handler() {
                        this.store.value *= 2
                        this.success()
                    }
                },
                setError: {
                    handler(value) {
                        this.error(value)
                    }
                }
            }
        }
    }
}
