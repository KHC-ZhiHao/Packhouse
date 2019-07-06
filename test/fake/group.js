let Packhouse = require('../../src/Main')

module.exports = {
    install(group, options) {
        group.test = options.test
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
        less: {
            create(store) {
                store.less = store.$coop('coop').tool('less')
            },
            action(a, b) {
                this.store
                    .less
                    .ng(this.error)
                    .action(a, b, this.success)
            }
        },
        toInt: {
            action(a) {
                this.success(this.store.$casting('int', a))
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
        },
        error: {
            action() {
                this.error('test')
            }
        }
    },
    lines: {
        compute: {
            molds: [],
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
