module.exports = {
    install(group, options) {
        group.ddb = options
    },
    tools: {
        get: {
            request: ['tableName', 'string'],
            handler(self, tableName, name) {
                self.success(tableName + name)
            }
        },
        optionTest: {
            install({ store, group }) {
                store.ddb = group.ddb
            },
            handler(self) {
                self.success(self.store.ddb)
            }
        }
    },
    lines: {
        query: {
            request: ['string'],
            install({ include }) {
                include('get').tool('get')
            },
            input(self, name) {
                self.store.name = name
                self.success()
            },
            output(self) {
                self.success(self.store.result)
            },
            layout: {
                get: {
                    handler(self, tableName) {
                        self.use('get')
                            .action(tableName, self.store.name, (err, result) => {
                                self.store.result = result
                                self.success()
                            })
                    }
                }
            }
        }
    }
}
