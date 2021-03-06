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
            array: [false, ['array'], () => []]
        }
    },
    tools: {
        sum: {
            request: ['number', 'number'],
            handler(self, value1, value2) {
                self.success(value1 + value2)
            }
        },
        assess: {
            install({ include }) {
                include('sum').tool('sum')
            },
            handler(self, value1, value2) {
                self.tool('sum').action(value1, value2, self.assess(result => result - 5))
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
            response: 'number|int',
            handler(self, value1, value2) {
                self.success(value1 + value2)
            }
        },
        get: {
            request: ['string'],
            install({ include }) {
                include('get').tool('dynamoDB/get', 'a')
            },
            handler(self, name) {
                self.tool('get')
                    .noGood(self.error)
                    .action(name, self.success)
            }
        },
        coopLine: {
            install({ include }) {
                include('query').line('dynamoDB/query')
            },
            handler(self, name) {
                self.line('query')(name)
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
        moldStringIs: {
            request: ['string|is: a, b'],
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
            request: ['number|int|min:10|max:20'],
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
            request: ['type|is:string', 'type?'],
            handler(self) {
                self.success(true)
            }
        },
        moldAbeTest: {
            request: ['string?', 'number?', 'boolean?', 'number?|int', 'array?', 'buffer?', 'object?', 'function?', 'date?'],
            handler(self) {
                self.success(true)
            }
        },
        moldCasting: {
            request: ['number|int'],
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
                self.tool('sum')
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
            install({ store, packhouse }) {
                store.order = packhouse.order()
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
            install({ store, packhouse }) {
                store.order = packhouse.order()
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
            install({ store, packhouse }) {
                store.order = packhouse.order()
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
            install({ store, packhouse }) {
                store.order = packhouse.order()
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
        orderTestExpired: {
            install({ store, packhouse }) {
                store.order = packhouse.order({
                    expired: 100
                })
            },
            handler(self, name) {
                self.store
                    .order
                    .use(name, self, (error, success) => {
                        success(self.store.order)
                    })
            }
        },
        includeExpression: {
            install({ include }) {
                include('get').tool('dynamoDB/get', 'a')
            },
            handler(self, name) {
                self.tool('get')
                    .noGood(self.error)
                    .action(name, self.success)
            }
        },
        includeExpressionLine: {
            install({ include }) {
                include('query').line('dynamoDB/query')
            },
            handler(self, name) {
                self.line('query')(name)
                    .get('123')
                    .action((err, result) => {
                        self.success(result)
                    })
            }
        },
        linePack: {
            install({ include }) {
                include('math').line('math', 10)
            },
            handler(self) {
                self.line('math')()
                    .add(10)
                    .action((err, result) => {
                        self.success(result)
                    })
            }
        },
        notTool: {
            install({ include }) {
                include('math').line('math')
            },
            handler(self) {
                self.tool('math')
            }
        },
        notLine: {
            install({ include }) {
                include('math').tool('sum')
            },
            handler(self) {
                self.line('math')
            }
        },
        loaderTest: {
            install({ store, utils }) {
                store.sum = utils.loader(async(done) => {
                    setTimeout(() => {
                        done((v1, v2) => v1 + v2)
                    }, 100)
                })
            },
            handler(self, v1, v2) {
                self.store
                    .sum()
                    .then(cb => self.success(cb(v1, v2)))
            }
        },
        loaderTestError: {
            install({ store, utils }) {
                store.sum = utils.loader(async(done, reject) => {
                    setTimeout(() => {
                        reject('OuO')
                    }, 100)
                })
            },
            handler(self, v1, v2) {
                self.store
                    .sum()
                    .then(self.success)
                    .catch(self.error)
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
            response: 'number|int',
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
                        self.tool('sum')
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
