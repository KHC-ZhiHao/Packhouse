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
                }
            }
        }
    }
}
