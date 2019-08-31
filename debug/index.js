let { Factory } = require('../src/Main')

let factory = new Factory()

factory.on('use', (event, { group, type, name }) => {
    console.log(group)
})

factory.on('run', (event, { id, caller, detail }) => {
    console.log(detail)
})

factory.on('done', (event, { id, caller, detail }) => {
    console.log(detail)
})

factory.step([
    function validate(self, next) {
        self.tool('aaa', 'bbb')
    },
    function sum(self, next) {

    }
])

factory.addGroup('AAA', {
    tools: {
        aaa: {
            install(store, include, system) {
                include('abc').tool('bbb').pack(5)
            },
            handler() {
                this.used.abc.action(10, (e, r) => {
                    this.used.abc.action(10, (e, r) => {
                        this.success(r)
                    })
                })
            }
        },
        bbb: {
            handler(number, n) {
                this.success(number + n)
            }
        }
    },
    lines: {
        ccc: {
            molds: [],
            frame(include, system) {
                include('abc').tool('bbb').pack(5)
            },
            input() {
                this.store.result = null
                this.success()
            },
            output() {
                this.success(this.store.result)
            },
            layout: {
                ddd: {
                    molds: [],
                    handler() {
                        // console.log(this.context)
                        this.used.abc.action(10, (e, r) => {
                            this.store.result = r
                            this.success()
                        })
                    }
                }
            }
        }
    }
})

try {
    // factory.tool('AAA', 'aaa').promise().then(() => {
    //     console.log('123')
    // })
    factory.tool('AAA', 'aaa').action(console.log)
    // factory.line('AAA', 'ccc')().ddd().action((e, r) => {
    //     console.log(r)
    // })
} catch (error) {
    console.error(error.stack)
}

// eslint-disable-next-line no-debugger
debugger
