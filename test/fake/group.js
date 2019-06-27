let Packhouse = require('../../src/Main')

module.exports = {
    alias: 'fake',
    mergers: {
        self: 'test'
    },
    install(store, options) {
        store.test = options.test
    },
    molds: {
        isTen: {
            check(value) {
                return value === 10 ? true : `Number not 10`
            }
        },
        is: {
            check(value, context) {
                // eslint-disable-next-line valid-typeof
                return typeof value === context.extras[0]
            },
            casting() {
                return 10
            }
        }
    },
    tools: {
        sum: {
            create(store) {
                store.order = Packhouse.createOrder()
            },
            action(a, b) {
                this.store
                    .order
                    .use(`${a}+${b}`, this.error, this.success, (error, success) => {
                        success(a + b)
                    })
            }
        },
        double: {
            action(a) {
                this.success(a * 2)
            }
        },
        isTen: {
            molds: ['isTen'],
            action() {
                this.success(true)
            }
        },
        isStringAndToTen: {
            molds: ['is|string'],
            action(value) {
                this.success(value)
            }
        },
        isboolean: {
            molds: ['boolean'],
            action() {
                this.success(true)
            }
        }
    },
    lines: {
        compute: {
            molds: [],
            inlet: null,
            input() {
                this.store.target = 0
                this.success()
            },
            output() {
                this.success(this.store.target)
            },
            layout: {
                add: {
                    action(number) {
                        this.store.target += number
                        this.success()
                    }
                },
                double() {
                    this.store.target *= 2
                    this.success()
                },
                error() {
                    this.error('test')
                }
            }
        }
    }
}
