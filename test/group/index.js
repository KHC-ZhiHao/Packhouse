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
            molds: ['number', 'number'],
            handler(value1, value2) {
                this.success(value1 + value2)
            }
        },
        get: {
            molds: ['string'],
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
            molds: ['string', 'boolean', 'array', 'buffer', 'object', 'function', 'date', 'required'],
            handler() {
                this.success(true)
            }
        },
        moldAbeTest: {
            molds: ['string', 'string|abe'],
            handler() {
                this.success(true)
            }
        },
        moldCasting: {
            molds: ['int'],
            handler(number) {
                this.success(number)
            }
        },
        customMold: {
            molds: ['isTenAndToString'],
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
        }
    },
    lines: {
        math: {
            molds: ['number'],
            frame({ include }) {
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
                    molds: ['number'],
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
                }
            }
        }
    }
}
