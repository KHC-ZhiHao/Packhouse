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
        },
        verifyOptions: {
            name: [true, ['string']],
            array: [false, ['array'], () => []],
        }
    },
    tools: {
        sum: {
            request: ['number', 'number'],
            handler(self, value1, value2) {
                self.success(value1 + value2)
            }
        },
        moldVerifyOptions: {
            request: ['verifyOptions'],
            handler(self, object) {
                self.success(object)
            }
        },
        responseTest: {
            request: ['number', 'number'],
            response: 'int',
            handler(self, value1, value2) {
                self.success(value1 + value2)
            }
        },
        get: {
            request: ['string'],
            install({ include }) {
                include('get').coop('dynamoDB').tool('get').pack('a')
            },
            handler(self, name) {
                self.use('get')
                    .noGood(self.error)
                    .action(name, self.success)
            }
        },
        coopLine: {
            install({ include }) {
                include('query').coop('dynamoDB').line('query')
            },
            handler(self, name) {
                self.use('query')(name)
                    .get('123')
                    .action((err, result) => {
                        self.success(result)
                    })
            }
        },
        toolCantReturn: {
            install({ include }) {
                include('query').line('math').action(() => {})
            },
            handler(self) {
                self.success()
            }
        },
        moldTest: {
            request: ['type|is:string', 'type|is:number', 'string', 'number', 'boolean', 'array', 'buffer', 'object', 'function', 'date', 'required'],
            handler(self) {
                self.success(true)
            }
        },
        moldTestForDate: {
            request: ['date'],
            handler(self) {
                self.success(true)
            }
        },
        moldTestForRequired: {
            request: ['required'],
            handler(self) {
                self.success(true)
            }
        },
        moldTestForNumber: {
            request: ['number|min:10|max:20'],
            handler(self) {
                self.success(true)
            }
        },
        moldTestForInt: {
            request: ['int|min:10|max:20'],
            handler(self) {
                self.success(true)
            }
        },
        moldTestAndNull: {
            request: [null, 'string'],
            handler(self) {
                self.success(true)
            }
        },
        moldTestAndResponse: {
            response: 'number',
            handler(self, value) {
                self.success(value)
            }
        },
        moldTypeTest: {
            request: ['type|is:string', 'type|abe'],
            handler(self) {
                self.success(true)
            }
        },
        moldAbeTest: {
            request: ['string|abe', 'number|abe', 'boolean|abe', 'int|abe', 'array|abe', 'buffer|abe', 'object|abe', 'function|abe', 'date|abe'],
            handler(self) {
                self.success(true)
            }
        },
        moldCasting: {
            request: ['int'],
            handler(self, number) {
                self.success(number)
            }
        },
        customMold: {
            request: ['isTenAndToString'],
            handler(self, string) {
                self.success(string)
            }
        },
        storeTest: {
            install({ store }) {
                store.result = 'test'
            },
            handler(self) {
                self.success(self.store.result)
            }
        },
        includeTest: {
            install({ include }) {
                include('sum').tool('sum')
            },
            handler(self, value1, value2) {
                self.use('sum')
                    .action(value1, value2, (e, r) => {
                        self.success(r)
                    })
            }
        },
        groupTest: {
            install({ store, group }) {
                store.test = group.test
            },
            handler(self) {
                self.success(self.store.test)
            }
        },
        handlerCasting: {
            handler(self, value) {
                try {
                    self.success(self.casting('isTenAndToString', value))
                } catch (e) {
                    self.error(e)
                }
            }
        },
        utilsTest: {
            install({ store, utils }) {
                store.getType = utils.getType
            },
            handler(self, value) {
                self.success(self.store.getType(value))
            }
        },
        orderTest: {
            install({ store, utils }) {
                store.order = utils.order()
            },
            handler(self, name) {
                self.store
                    .order
                    .getOrCreat(name)
                    .buffer(self)
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
            handler(self, name) {
                self.store
                    .order
                    .use(name, self, (error, success) => {
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
            handler(self, name) {
                self.store
                    .order
                    .use(name, self, (error, success) => {
                        success(name)
                    })
            }
        },
        orderTestForUseAndError: {
            install({ store, utils }) {
                store.order = utils.order()
            },
            handler(self, name) {
                self.store
                    .order
                    .use(name, self, (error) => {
                        setTimeout(() => {
                            error(name)
                        }, 100)
                    })
            }
        },
        includeExpression: {
            install({ include }) {
                include('get').tool('dynamoDB/get').pack('a')
            },
            handler(self, name) {
                self.use('get')
                    .noGood(self.error)
                    .action(name, self.success)
            }
        },
        includeExpressionLine: {
            install({ include }) {
                include('query').line('dynamoDB/query')
            },
            handler(self, name) {
                self.use('query')(name)
                    .get('123')
                    .action((err, result) => {
                        self.success(result)
                    })
            }
        }
    },
    lines: {
        outputError: {
            input(self) {
                self.success()
            },
            output(self) {
                self.error('test')
            },
            layout: {}
        },
        mathResponse: {
            request: ['number'],
            response: 'int',
            input(self, value) {
                self.store.value = value
                self.success()
            },
            output(self) {
                self.success(self.store.value)
            },
            layout: {
                add: {
                    request: ['number'],
                    handler(self, value) {
                        self.store.value += value
                        self.success()
                    }
                }
            }
        },
        math: {
            request: ['number'],
            install({ include }) {
                include('sum').tool('sum')
            },
            input(self, value) {
                self.store.value = value
                self.success()
            },
            output(self) {
                self.success(self.store.value)
            },
            layout: {
                add: {
                    request: ['number'],
                    handler(self, value) {
                        self.use('sum')
                            .action(self.store.value, value, () => {
                                self.store.value += value
                                self.success()
                            })
                    }
                },
                double: {
                    handler(self) {
                        self.store.value *= 2
                        self.success()
                    }
                },
                setError: {
                    handler(self, value) {
                        self.error(value)
                    }
                }
            }
        }
    }
}
