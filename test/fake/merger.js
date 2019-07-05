module.exports = {
    molds: {
        toFive: {
            casting() {
                return 5
            }
        }
    },
    groups: {
        test: {
            install(group, options) {
                group.test = options.test
            },
            tools: {
                get: {
                    action() {
                        this.success(this.store.$group.test)
                    }
                },
                callSelf: {
                    create(store) {
                        store.toFive = store.$coop('to').tool('five')
                    },
                    action(value) {
                        this.store.toFive.ng(this.error).action(value, this.success)
                    }
                }
            }
        },
        to: {
            tools: {
                five: {
                    molds: ['toFive'],
                    action(value) {
                        this.success(value)
                    }
                }
            }
        }
    }
}