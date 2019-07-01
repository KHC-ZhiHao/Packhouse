const factory = require('factory')

factory.on('error', (context) => {
    console.log(context)
})

const step = Packhouse.createStep({
    timeout: 25000,
    addon(templates, options) {
        if (options.type === 'request') {
            return [].concat(templates)
        }
        return templates
    },
    input(args, options, { exit, fail }) {
        this.io = oobe.make('io', options.type).$born(args)
        this.factory = factory
    },
    middle({ exit, fail }) {
        this.io.$fn.ifDone(exit)
    },
    output({ message }) {
        if (message === 'timeout') {
            return this.io.$export('timeout')
        }
        return this.io.$export()
    }
})

let target = step.generator({
    options: {
        type: 'request',
        name: 'get ddb data'
    },
    templates: [
        async function validate(next) {
            this.factory
                .tool('helper', 'validate')
                .rule(this.io.$fn.errorValidate, next, { resolve: true })
                .promise(this.io.get('all'))
        },
        async function get_data(next) {
            this.factory
                .tool('aws@ddb', 'get')
                .rule(this.io.$fn.error, next)
                .pack(this.get('query').name)
                .action(this.io.$fn.response)
        }
    ]
})

describe('#Step', () => {
    before(function() {
        this.factory = Packhouse.createFactory()
        this.factory.merger('merger', Merger, { test: 'test' })
    })
    it('add and has group', function() {
        this.factory.addGroup('test', Group)
        expect(this.factory.hasGroup('test')).to.equal(true)
        expect(this.factory.hasGroup('fail')).to.equal(false)
    })
})
