module.exports = {
    alias: 'fake',
    install(store, options) {
        store.test = options.test
    },
    tools: {
        sum: {
            action(a, b) {
                this.$success(a + b)
            }
        }
    },
    lines: {
        compute: {
            molds: [],
            inlet: null,
            input() {
                this.$store.target = 0
                this.$success()
            },
            output() {
                this.$success(this.$store.target)
            },
            layout: {
                add: {
                    action(number) {
                        this.$store.target += number
                        this.$success()
                    }
                },
                double() {
                    this.$store.target *= 2
                    this.$success()
                }
            }
        }
    }
}
