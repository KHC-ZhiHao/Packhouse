module.exports = {
    alias: 'fake_merger',
    install(store, options) {
        store.test = options.test
    },
    tools: {
        less: {
            action(target, value) {
                this.success(target - value)
            }
        }
    }
}
