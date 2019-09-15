const Step = require('../plugins/Step')
const Packhouse = require('../src/Main')

const expect = require('chai').expect
const group = require('./group')

describe('#Step', () => {
    it('success', function(done) {
        let template = [
            function(next) {
                next()
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.step({
            template,
            output(context, success) {
                success('123')
            }
        })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })
    it('error', function(done) {
        let template = [
            function(next) {
                next()
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.step({
            template,
            output(context, success, error) {
                error('123')
            }
        })
            .catch((result) => {
                expect(result).to.equal('123')
                done()
            })
    })

    it('history', function(done) {
        let template = [
            function(next) {
                packhouse.tool('demo', 'includeTest').action(10, 20, () => {
                    next()
                })
            },
            function(next) {
                packhouse.tool('demo', 'get').action(123, () => {
                    next()
                })
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.addGroup('demo', group)
        packhouse.merger('aws', require('./merger/aws/index.js'))
        packhouse.step({
            template,
            output({ history }, success, error) {
                expect(typeof history.toJSON(true)).to.equal('string')
                success('123')
            }
        })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })

    it('history error', function(done) {
        let template = [
            function(next) {
                packhouse
                    .tool('demo', 'get')
                    .action(123, () => {
                        next()
                    })
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.addGroup('demo', group)
        packhouse.merger('aws', require('./merger/aws/index.js'))
        packhouse.step({
            template,
            output({ history }, success, error) {
                let key = Object.keys(history.template[0].logs)[0]
                expect(history.template[0].logs[key].result instanceof Error).to.equal(true)
                success('123')
            }
        })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })

    it('step of line', function(done) {
        let template = [
            function(next) {
                packhouse
                    .tool('demo', 'coopLine')
                    .action('b', (e, r) => {
                        this.result = r
                        next()
                    })
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.addGroup('demo', group)
        packhouse.merger('aws', require('./merger/aws/index.js'))
        packhouse.step({
            template,
            output({ history }, success, error) {
                console.log(history.toJSON(true))
                expect(typeof history.toJSON(true)).to.equal('string')
                success('123')
            }
        })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })
})
