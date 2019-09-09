let dynamoDB = require('./dynamodb')

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
        dynamoDB
    }
}
