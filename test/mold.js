const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Group = require('./fake/group')

describe('#Mold', () => {
    before(function() {
        this.factory = Packhouse.createFactory()
        this.factory.addGroup('test', Group, {})
    })
    it('test mold check', function() {
        this.factory
            .tool('test', 'isTen')
            .action(10, (err, result) => {
                expect(result).to.equal(true)
            })
        this.factory
            .tool('test', 'isTen')
            .ng((err) => { expect(err).to.equal('Number not 10') })
            .action(11, (result) => {
                expect(result).to.equal(true)
            })
    })
    it('test system mold', function() {
        this.factory
            .tool('test', 'isBoolean')
            .action(true, (err, result) => {
                expect(result).to.equal(true)
            })
        this.factory
            .tool('test', 'isBoolean')
            .ng((err) => { expect(err).to.be.a('string') })
            .action(true, (result) => {
                expect(result).to.equal(true)
            })
        this.factory
            .tool('test', 'isBuffer')
            .action(Buffer.from([]), (err, result) => {
                expect(result).to.equal(true)
            })
    })
    it('test object in', function() {
        this.factory
            .tool('test', 'keyHasRoot')
            .action({ root: '123' }, (err, result) => {
                expect(result).to.equal(true)
            })
        this.factory
            .tool('test', 'keyHasRoot')
            .action({}, (err, result) => {
                expect(!!err).to.equal(true)
            })
    })
    it('test extras mold', function() {
        this.factory
            .tool('test', 'isStringAndToTen')
            .action('123456', (err, result) => {
                expect(result).to.equal(10)
            })
        this.factory
            .tool('test', 'isStringAndToTen')
            .action(123456, (err, result) => {
                expect(err).to.be.a('string')
            })
    })
})
