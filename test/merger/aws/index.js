let dynamoDB = require('./dynamodb')

module.exports = {
    molds: {
        tableName: {
            check(value) {
                return typeof value === 'string' ? true : 'error'
            },
            casting(value) {
                return 'table - ' + value
            }
        }
    },
    groups: {
        dynamoDB
    }
}
