const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Group = require('./fake/group')
const Coop = require('./fake/Coop')

describe('#Tool', () => {
    before(function() {
        this.factory = Packhouse.createFactory()
        this.factory.addGroup('test', Group)
        this.factory.addGroup('coop', Coop)
    })
    it('action', function() {
        this.factory
            .tool('test', 'sum')
            .action(10, 20, (err, reslut) => {
                expect(reslut).to.equal(30)
            })
    })
    it('promise', function(done) {
        this.factory
            .tool('test', 'sum')
            .promise(10, 10)
            .then((reslut) => {
                expect(reslut).to.equal(20)
                done()
            })
    })
    it('recursive', function() {
        this.factory
            .tool('test', 'sum')
            .recursive(10, 20, (err, reslut, context) => {
                if (reslut !== 60) {
                    context.stack(reslut, 10)
                } else {
                    expect(reslut).to.equal(60)
                }
            })
        this.factory
            .tool('test', 'sum')
            .recursive(0, 10, (err, reslut, context) => {
                if (reslut !== 60) {
                    context.stack(reslut, 10)
                } else {
                    expect(context.count).to.equal(5)
                }
            })
    })
    it('coop', function() {
        this.factory
            .tool('test', 'less')
            .action(20, 10, (err, reslut) => {
                expect(reslut).to.equal(10)
            })
    })
    it('casting', function() {
        this.factory
            .tool('test', 'toInt')
            .action(1.5487, (err, reslut) => {
                expect(reslut).to.equal(1)
            })
    })
    it('ng', function() {
        this.factory
            .tool('test', 'error')
            .action((err, reslut) => {
                expect(err).to.equal('test')
            })
        this.factory
            .tool('test', 'error')
            .ng((err) => { expect(err).to.equal('test') })
            .action(() => {
                expect(true).to.equal(false)
            })
    })
    it('sop', function() {
        let dosop = false
        let errorDoSop = false
        this.factory
            .tool('test', 'sum')
            .sop(() => { dosop = true })
            .action(10, 20, (err, reslut) => {
                expect(reslut).to.equal(30)
            })
        this.factory
            .tool('test', 'error')
            .ng((err) => { expect(err).to.equal('test') })
            .sop(() => { errorDoSop = true })
            .action(() => {
                expect(true).to.equal(false)
            })
        expect(dosop).to.equal(true)
        expect(errorDoSop).to.equal(true)
    })
    it('rule', function() {
        let dong = false
        let dosop = false
        this.factory
            .tool('test', 'sum')
            .rule(null, () => { dosop = true })
            .action(10, 20, (err, reslut) => {
                expect(reslut).to.equal(30)
            })
        this.factory
            .tool('test', 'error')
            .rule((err) => { dong = true })
            .action(() => {
                expect(true).to.equal(false)
            })
        expect(dong).to.equal(true)
        expect(dosop).to.equal(true)
    })
    it('weld', function() {
        this.factory
            .tool('test', 'sum')
            .pack(10, 20)
            .weld('double', (reslut, pack) => { pack(reslut) })
            .action((err, reslut) => {
                expect(reslut).to.equal(60)
            })
    })
    it('weld for error', function() {
        let err = false
        this.factory
            .tool('test', 'sum')
            .pack(10, 20)
            .ng(() => { err = true })
            .weld('error', (reslut, pack) => { pack(reslut) })
            .action(() => {})
        expect(err).to.equal(true)
    })
    it('clear', function() {
        this.factory
            .tool('test', 'sum')
            .pack(10)
            .clear()
            .action(30, 30, (err, reslut) => {
                expect(reslut).to.equal(60)
            })
    })
    it('pack', function() {
        this.factory
            .tool('test', 'sum')
            .pack(10)
            .action(30, (err, reslut) => {
                expect(reslut).to.equal(40)
            })
    })
    it('rePack', function() {
        this.factory
            .tool('test', 'sum')
            .pack(10)
            .rePack(20)
            .action(30, (err, reslut) => {
                expect(reslut).to.equal(50)
            })
    })
})
