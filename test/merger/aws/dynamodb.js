module.exports = {
    install(group, options) {
        group.ddb = options
    },
    tools: {
        get: {
            request: ['tableName', 'string'],
            handler(tableName, name) {
                this.success(tableName + name)
            }
        },
        optionTest: {
            install({ store, group }) {
                store.ddb = group.ddb
            },
            handler() {
                this.success(this.store.ddb)
            }
        }
    },
    lines: {
        query: {
            request: ['string'],
            frame({ include }) {
                include('get').tool('get')
            },
            input(name) {
                this.store.name = name
                this.success()
            },
            output() {
                this.success(this.store.result)
            },
            layout: {
                get: {
                    handler(tableName) {
                        this.use('get')
                            .action(tableName, this.store.name, (err, result) => {
                                this.store.result = result
                                this.success()
                            })
                    }
                }
            }
        }
    }
}
