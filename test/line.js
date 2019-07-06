const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Group = require('./fake/group')

describe('#Line', () => {
    before(function() {
        this.factory = Packhouse.createFactory()
        this.factory.addGroup('test', Group, {})
    })
    it('base test', function() {
        this.factory
            .line('test', 'compute')(0)
            .add(5)
            .double()
            .double()
            .action((err, result) => {
                expect(result).to.equal(20)
            })
    })
    it('set rule', function() {
        let sop = (context) => { expect(context.success).to.equal(false) }
        let error = (err) => {
            expect(err).to.equal('test')
        }
        this.factory
            .line('test', 'compute')(0)
            .setRule(error, sop)
            .add(5)
            .error()
            .action((result) => {
                expect(result).to.equal(true)
            })
    })
    it('promise', function(done) {
        this.factory
            .line('test', 'compute')(0)
            .add(5)
            .double()
            .promise()
            .then((result) => {
                expect(result).to.equal(10)
                done()
            })
    })
    it('promise catch', function(done) {
        this.factory
            .line('test', 'compute')(0)
            .add(5)
            .error()
            .promise()
            .catch((error) => {
                expect(error).to.equal('test')
                done()
            })
    })
})
