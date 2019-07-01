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
        this.factory
            .tool('merger@test', 'callSelf')
            .action(87, (error, result) => {
                expect(result).to.equal(5)
            })
    })
    it('event', function() {
        let count = 0
        this.factory.on('action-tool-before', (context) => {
            expect(context.caller.type).to.equal('tool')
        })
        this.factory.on('action-line-before', (context) => {
            count += 1
            expect(context.caller.type).to.equal('line')
        })
        this.factory.on('action-line-before', (context) => {
            count += 1
            expect(context.caller.type).to.equal('line')
        })
        this.factory.on('use-before', (context) => {
            expect(context.groupName).to.equal('test')
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
        expect(count).to.equal(2)
    })
})
