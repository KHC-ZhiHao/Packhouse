const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Group = require('./fake/group')

describe('#Factory', () => {
    before(function() {
        this.factory = Packhouse.createFactory()
    })
    it('add and has group', function() {
        this.factory.addGroup('test', Group, {})
        expect(this.factory.hasGroup('test')).to.equal(true)
        expect(this.factory.hasGroup('fail')).to.equal(false)
    })
    it('add and has mold', function() {
        this.factory.addMold('test', {})
        expect(this.factory.hasMold('test')).to.equal(true)
        expect(this.factory.hasMold('string')).to.equal(true)
        expect(this.factory.hasMold('fail')).to.equal(false)
    })
    it('tool', function() {
        this.factory
            .tool('test', 'sum')
            .action(5, 7, (error, result) => {
                expect(result).to.equal(12)
            })
    })
    it('line', function() {
        this.factory
            .line('test', 'compute')()
            .add(5)
            .double()
            .action((error, result) => {
                expect(result).to.equal(10)
            })
    })
    it('event', function() {})
})
