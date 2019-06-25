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
            fail() {

            },
            input() {

            },
            output() {

            },
            layout: {

            }
        }
    }
}
