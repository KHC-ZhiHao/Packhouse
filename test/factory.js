const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Group = require('./fake/group')
const Merger = require('./fake/merger')

describe('#Factory', () => {
    before(function() {
        this.factory = Packhouse.createFactory()
        this.factory.merger('merger', Merger, { test: 'test' })
    })
    it('add and has group', function() {
        this.factory.addGroup('test', Group)
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
    it('merger', function() {
        this.factory
            .tool('merger@test', 'get')
            .action((error, result) => {
                expect(result).to.equal('test')
            })
    })
    it('merger and call self', function() {
        this.factory.on('use-before', function(context) {
            expect(context.name).be.a('string')
        })
        this.factory
            .tool('merger@test', 'callSelf')
            .action(87, (error, result) => {
                expect(result).to.equal(5)
            })
        this.factory
            .tool('merger@test', 'mergerString')
            .action('123', (error, result) => {})
    })
    it('use packhouse', function() {
        this.factory
            .tool('test', 'usePackhouse')
            .action((error, result) => {
                expect(result).to.equal(true)
            })
    })
    it('event', function() {
        this.factory.on('use-before', (context) => {
            if (context.groupSign) {
                expect(context.groupSign).to.equal('merger')
            } else {
                expect(context.groupName).to.equal('test')
            }
        })
        this.factory
            .line('test', 'compute')()
            .add(5)
            .double()
            .action((error, result) => {
                expect(result).to.equal(10)
            })
        this.factory
            .tool('test', 'sum')
            .action(5, 7, (error, result) => {
                expect(result).to.equal(12)
            })
        this.factory
            .tool('merger@test', 'callSelf')
            .action(87, (error, result) => {
                expect(result).to.equal(5)
            })
    })
})
