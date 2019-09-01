const Packhouse = require('../src/Main')
const expect = require('chai').expect
const group = require('./group')
const merger = require('./merger/aws/index')
describe('#Packhouse', () => {
    before(function() {
        this.packhouse = new Packhouse()
    })

    it('add Group', function() {
        this.packhouse.addGroup('demoGroup', group, { test: 'test' })
        expect(this.packhouse.hasGroup('demoGroup')).to.equal(true)
        expect(this.packhouse.hasGroup('demoGroup22')).to.equal(false)
    })

    it('add Merger', function() {
        this.packhouse.merger('aws', merger, { ddb: 'test' })
        expect(this.packhouse.hasGroup('aws@dynamoDB')).to.equal(true)
        expect(this.packhouse.hasGroup('aws@dynamoDB2')).to.equal(false)
    })

    it('use tool', function() {
        let isRun = false
        this.packhouse
            .tool('demoGroup', 'sum')
            .action(10, 20, (error, result) => {
                isRun = true
                expect(result).to.equal(30)
            })
        expect(isRun).to.equal(true)
    })

    it('use tool promise', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .promise(10, 20)
            .then(result => {
                expect(result).to.equal(30)
                done()
            })
    })

    it('no good', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .noGood(e => {
                expect(typeof e).to.equal('string')
                done()
            })
            .action('', '', () => {
                throw new Error('???')
            })
    })

    it('always', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .always(({ result, success }) => {
                expect(result).to.equal(30)
                expect(success).to.equal(true)
                done()
            })
            .action(10, 20, (error, result) => {
                expect(result).to.equal(30)
            })
    })

    it('always error', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .always(({ result, success }) => {
                expect(success).to.equal(false)
                done()
            })
            .action('', '', () => {})
    })

    it('repack', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .pack(10)
            .repack(20)
            .action(10, (e, r) => {
                expect(r).to.equal(30)
                done()
            })
    })

    it('weld', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .pack(10, 20)
            .weld('sum', (result, pack) => pack(result, 10))
            .weld('sum', (result, pack) => pack(result, 20))
            .action((e, r) => {
                expect(r).to.equal(60)
                done()
            })
    })

    it('weld of error', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .pack(10, 20)
            .weld('sum', (result, pack) => pack(result, '10'))
            .action((e, r) => {
                expect(typeof e).to.equal('string')
                done()
            })
    })

    it('use mold', function() {
        let isRun = false
        this.packhouse
            .tool('demoGroup', 'moldTest')
            .pack('string')
            .pack(true)
            .pack([])
            .pack(Buffer.from([]))
            .pack({})
            .pack(() => {})
            .pack('2018-01-01')
            .pack('require')
            .action((e, r) => {
                isRun = r
            })
        expect(isRun).to.equal(true)
    })

    it('use mold', function() {
        let isRun = false
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack('string')
            .pack(undefined)
            .action((e, r) => {
                isRun = r
            })
        expect(isRun).to.equal(true)
    })

    it('casting', function(done) {
        this.packhouse
            .tool('demoGroup', 'moldCasting')
            .action(5.487, (e, r) => {
                expect(r).to.equal(5)
                done()
            })
    })

    it('custom mold', function(done) {
        this.packhouse
            .tool('demoGroup', 'customMold')
            .action(10, (e, r) => {
                expect(r).to.equal('10')
                done()
            })
    })

    it('mold error', function(done) {
        this.packhouse
            .tool('demoGroup', 'customMold')
            .action(123, (e, r) => {
                expect(e).to.equal('Error')
                done()
            })
    })

    it('store', function(done) {
        this.packhouse
            .tool('demoGroup', 'storeTest')
            .action((e, r) => {
                expect(r).to.equal('test')
                done()
            })
    })

    it('include', function(done) {
        this.packhouse
            .tool('demoGroup', 'includeTest')
            .action(5, 10, (e, r) => {
                expect(r).to.equal(15)
                done()
            })
    })

    it('group', function(done) {
        this.packhouse
            .tool('demoGroup', 'groupTest')
            .action((e, r) => {
                expect(r).to.equal('test')
                done()
            })
    })

    it('handler casting', function(done) {
        this.packhouse
            .tool('demoGroup', 'handlerCasting')
            .action(10, (e, r) => {
                expect(r).to.equal('10')
                this.packhouse
                    .tool('demoGroup', 'handlerCasting')
                    .action('123', (e, r) => {
                        expect(e).to.equal('Error')
                        done()
                    })
            })
    })

    it('handler utils', function(done) {
        this.packhouse
            .tool('demoGroup', 'utilsTest')
            .action(10, (e, r) => {
                expect(r).to.equal('number')
                done()
            })
    })

    it('use line', function(done) {
        this.packhouse
            .line('demoGroup', 'math')(5)
            .add(10)
            .double()
            .action((e, r) => {
                expect(r).to.equal(30)
                done()
            })
    })

    it('use line error', function(done) {
        this.packhouse
            .line('demoGroup', 'math')(5)
            .add('10')
            .double()
            .action((e, r) => {
                expect(typeof e).to.equal('string')
                done()
            })
    })

    it('merger', function(done) {
        this.packhouse
            .tool('aws@dynamoDB', 'get')
            .action('a', 'b', (e, r) => {
                expect(r).to.equal('table - ab')
                done()
            })
    })

    it('coop', function(done) {
        this.packhouse
            .tool('demoGroup', 'get')
            .action('b', (e, r) => {
                expect(r).to.equal('table - ab')
                done()
            })
    })

    it('event use', function(done) {
        this.packhouse.on('use', (event, { type, name, group }) => {
            expect(type).to.equal('tool')
            expect(name).to.equal('get')
            expect(group.name).to.equal('demoGroup')
            expect(group.sign).to.equal('')
            this.packhouse.off('use', event.id)
            done()
        })
        this.packhouse
            .tool('demoGroup', 'get')
            .action('b', (e, r) => {})
    })

    it('event run', function(done) {
        let callerId = null
        this.packhouse.on('run', (event, { id, caller, detail }) => {
            if (detail.group.name === 'dynamoDB') {
                expect(caller.id === callerId).to.equal(true)
                event.off()
                done()
            } else {
                expect(typeof id).to.equal('string')
                expect(caller).to.equal(null)
                callerId = id
            }
        })
        this.packhouse
            .tool('demoGroup', 'get')
            .action('b', (e, r) => {})
    })

    it('event done', function(done) {
        this.packhouse.on('done', (event, { detail }) => {
            if (detail.success === false) {
                expect(typeof detail.result).to.equal('string')
                event.off()
                done()
            }
            if (detail.success === true) {
                expect(detail.result).to.equal(30)
            }
        })
        this.packhouse
            .tool('demoGroup', 'sum')
            .promise(10, 20)
            .then(() => {
                this.packhouse
                    .tool('demoGroup', 'sum')
                    .action('10', 20, () => {})
            })
    })

    it('merger option', function(done) {
        this.packhouse
            .tool('aws@dynamoDB', 'optionTest')
            .action((e, r) => {
                expect(r).to.equal('test')
                done()
            })
    })

    it('orderTest', function(done) {
        let time = Date.now()
        this.packhouse
            .tool('demoGroup', 'orderTest')
            .action('123', () => {
                let nextTime = Date.now()
                expect(nextTime - time > 50).to.equal(true)
                this.packhouse
                    .tool('demoGroup', 'orderTest')
                    .action('123', () => {
                        let newNextTime = Date.now()
                        expect(newNextTime - nextTime > 50).to.equal(false)
                        done()
                    })
            })
    })

    it('plugin', function(done) {
        this.packhouse
            .plugin({
                install(packhouse) {
                    expect(typeof packhouse.utils.generateId()).to.equal('string')
                    done()
                }
            })
    })
})
