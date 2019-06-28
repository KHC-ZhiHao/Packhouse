module.exports = {
    alias: 'fake_merger',
    install(group, options) {
        group.test = options.test
    },
    tools: {
        less: {
            action(target, value) {
                this.success(target - value)
            }
        }
    }
}
