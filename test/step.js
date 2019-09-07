const Step = require('../plugins/Step')
const Packhouse = require('../src/Main')

const expect = require('chai').expect
const group = require('./group')

describe('#Step', () => {
    it('success', function(done) {
        const step = new Step({
            output(context, success) {
                success('123')
            }
        })
        let templates = [
            function(next) {
                next()
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(step)
        packhouse.step({ templates })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })
    it('error', function(done) {
        const step = new Step({
            output(context, success, error) {
                error('123')
            }
        })
        let templates = [
            function(next) {
                next()
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(step)
        packhouse.step({ templates })
            .catch((result) => {
                expect(result).to.equal('123')
                done()
            })
    })

    it('history', function(done) {
        const step = new Step({
            output({ history }, success, error) {
                success('123')
            }
        })
        let templates = [
            function(next) {
                packhouse.tool('demo', 'includeTest').action(10, 20, () => {
                    next()
                })
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(step)
        packhouse.addGroup('demo', group)
        packhouse.step({ templates })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })
})
