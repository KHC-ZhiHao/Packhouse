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
            .tool('test', 'isboolean')
            .action(true, (err, result) => {
                expect(result).to.equal(true)
            })
        this.factory
            .tool('test', 'isboolean')
            .ng((err) => { expect(err).to.be.a('string') })
            .action(true, (result) => {
                expect(result).to.equal(true)
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
