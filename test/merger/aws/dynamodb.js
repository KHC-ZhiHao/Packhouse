module.exports = {
    alias: 'dynamodb',
    install(group, { ddb }) {
        group.ddb = ddb
    },
    tools: {
        get: {
            molds: ['tableName', 'string'],
            handler(tableName, name) {
                this.success(tableName + name)
            }
        },
        optionTest: {
            install(store, include, { group }) {
                store.ddb = group.ddb
            },
            handler() {
                this.success(this.store.ddb)
            }
        }
    }
}
