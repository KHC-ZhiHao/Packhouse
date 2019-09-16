module.exports = {
    molds: {
        tableName(value) {
            if (typeof value === 'string') {
                return 'table - ' + value
            } else {
                throw new Error('error')
            }
        }
    },
    groups: {
        dynamoDB(options) {
            return {
                data: require('./dynamodb'),
                options: options.ddb
            }
        }
    }
}
