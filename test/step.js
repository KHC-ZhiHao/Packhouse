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
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.addGroup('demo', group)
        packhouse.step({
            template,
            output({ history }, success, error) {
                success('123')
            }
        })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })
})
