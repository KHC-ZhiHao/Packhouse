const Packhouse = require('../src/Main')
const expect = require('chai').expect
const group = require('./group')
const merger = require('./merger/aws/index')
describe('#Packhouse', () => {
    before(function() {
        this.packhouse = new Packhouse()
    })

    it('add group', function() {
        this.packhouse.addGroup('demoGroup', () => {
            return {
                data: group,
                options: {
                    test: 'test'
                }
            }
        })
        expect(this.packhouse.hasGroup('demoGroup')).to.equal(true)
        expect(this.packhouse.hasGroup('demoGroup22')).to.equal(false)
    })

    it('not found group check', function() {
        expect(() => {
            this.packhouse.addGroup(123, {})
        }).to.throw(Error)
        expect(() => {
            this.packhouse.addGroup('demoGroup', {})
        }).to.throw(Error)
        expect(() => {
            this.packhouse.line('demoGroupp', 'summ')()
        }).to.throw(Error)
        expect(() => {
            this.packhouse.tool('demoGroup', 'summ')
        }).to.throw(Error)
        expect(() => {
            this.packhouse.line('demoGroup', 'summ')()
        }).to.throw(Error)
    })

    it('add merger', function() {
        this.packhouse.merger('aws', merger, { ddb: 'test' })
        expect(this.packhouse.hasGroup('aws@dynamoDB')).to.equal(true)
        expect(this.packhouse.hasGroup('aws@dynamoDB2')).to.equal(false)
    })

    it('add merger already exists', function() {
        expect(() => {
            this.packhouse.merger('aws', merger, { ddb: 'test' })
        }).to.throw(Error)
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

    it('action no callback', function() {
        expect(() => {
            this.packhouse
                .tool('demoGroup', 'sum')
                .action(10, 20)
        }).to.throw(Error)
    })

    it('expression', function(done) {
        this.packhouse
            .tool('demoGroup/sum')
            .action(10, 20, (err, result) => {
                expect(result).to.equal(30)
                done()
            })
    })
    it('expression by include', function(done) {
        this.packhouse
            .tool('demoGroup/includeExpression')
            .action('123', (err, result) => {
                expect(result).to.equal('table - a123')
                done()
            })
    })
    it('expression by include of line', function(done) {
        this.packhouse
            .tool('demoGroup/includeExpressionLine')
            .action('123', (err, result) => {
                expect(result).to.equal('table - 123123')
                done()
            })
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
                expect(typeof e.error.message).to.equal('string')
                done()
            })
            .action('', '', () => {
                throw new Error('???')
            })
    })

    it('no good not callback', function() {
        expect(() => {
            this.packhouse
                .tool('demoGroup', 'sum')
                .noGood('123')
        }).to.throw(Error)
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

    it('always not callback', function() {
        expect(() => {
            this.packhouse
                .tool('demoGroup', 'sum')
                .always('123')
        }).to.throw(Error)
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
                expect(typeof e.error.message).to.equal('string')
                done()
            })
    })

    it('weld of error with no good', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .pack(10, 20)
            .weld('sum', (result, pack) => pack(result, '10'))
            .noGood((e) => {
                expect(typeof e.error.message).to.equal('string')
                done()
            })
            .action((r) => {})
    })

    it('add mold', function() {
        this.packhouse.addMold('test', function(value) {
            return value
        })
        expect(this.packhouse.hasMold('test')).to.equal(true)
        expect(this.packhouse.hasMold('testt')).to.equal(false)
        expect(() => {
            this.packhouse.addMold('test', function(value) {
                return value
            })
        }).to.throw(Error)
    })

    it('not found mold', function(done) {
        let packhouse = new Packhouse()
        packhouse.addGroup('test', () => {
            return {
                data: {
                    tools: {
                        test: {
                            request: ['aaaaa'],
                            handler() {
                                this.success()
                            }
                        }
                    }
                }
            }
        })
        packhouse.tool('test', 'test').action((e) => {
            expect(e.error.message).to.equal(`(☉д⊙)!! PackHouse::MoldBox => get -> Mold(aaaaa) not found.`)
            done()
        })
    })

    it('use mold', function() {
        let isRun = false
        this.packhouse
            .tool('demoGroup', 'moldTest')
            .pack('type')
            .pack(1234)
            .pack('string')
            .pack(4567)
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

    it('use mold and null', function(done) {
        this.packhouse
            .tool('demoGroup', 'moldTestAndNull')
            .pack(1234, '1234')
            .action((e, r) => {
                expect(r).to.equal(true)
                done()
            })
    })

    it('use mold and response', function(done) {
        this.packhouse
            .tool('demoGroup', 'moldTestAndResponse')
            .pack(1234)
            .action((e, r) => {
                expect(r).to.equal(1234)
            })
        this.packhouse
            .tool('demoGroup', 'moldTestAndResponse')
            .pack('1234')
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
                done()
            })
    })

    it('use mold type error', function(done) {
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack(123)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack(null, true)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack(null, null, 123)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack(null, null, null, true)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack(null, null, null, null, true)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack(null, null, null, null, null, true)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack(null, null, null, null, null, null, true)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack(null, null, null, null, null, null, null, true)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
                done()
            })
    })

    it('use mold date', function() {
        this.packhouse
            .tool('demoGroup', 'moldTestForDate')
            .pack('fkwopfkopwe')
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldTestForDate')
            .pack(true)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
    })

    it('use mold required', function(done) {
        this.packhouse
            .tool('demoGroup', 'moldTestForRequired')
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
                done()
            })
    })

    it('use mold number', function() {
        this.packhouse
            .tool('demoGroup', 'moldTestForInt')
            .pack(9)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldTestForInt')
            .pack(21)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
    })

    it('use mold int', function() {
        this.packhouse
            .tool('demoGroup', 'moldTestForNumber')
            .pack(9)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldTestForNumber')
            .pack(21)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
        this.packhouse
            .tool('demoGroup', 'moldTestForNumber')
            .pack('15')
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
            })
    })

    it('use mold for abe', function() {
        let isRun = false
        this.packhouse
            .tool('demoGroup', 'moldAbeTest')
            .pack(undefined)
            .pack(null)
            .pack(null)
            .pack(null)
            .pack(null)
            .pack(null)
            .pack(null)
            .pack(null)
            .pack(null)
            .action((e, r) => {
                isRun = r
            })
        expect(isRun).to.equal(true)
    })

    it('use mold type error', function(done) {
        this.packhouse
            .tool('demoGroup', 'moldTypeTest')
            .pack(4567)
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
                done()
            })
    })

    it('use mold type abe', function(done) {
        this.packhouse
            .tool('demoGroup', 'moldTypeTest')
            .pack('1234', null)
            .action((e, r) => {
                expect(r).to.equal(true)
                done()
            })
    })

    it('use mold type no is', function(done) {
        this.packhouse
            .tool('demoGroup', 'moldTypeTest')
            .pack('1234', '1234')
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
                done()
            })
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
                expect(e.error.message).to.equal('Error')
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
                        expect(e.message).to.equal('Error')
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

    it('response', function(done) {
        this.packhouse
            .tool('demoGroup', 'responseTest')
            .action(10.1, 20.2, (error, result) => {
                expect(result).to.equal(30)
                done()
            })
    })

    it('response line', function(done) {
        this.packhouse
            .line('demoGroup', 'mathResponse')(10)
            .add(20.5)
            .action((error, result) => {
                expect(result).to.equal(30)
                done()
            })
    })

    it('line layout can\'t action', function() {
        let packhouse = new Packhouse()
        packhouse.addGroup('test', () => {
            return {
                data: {
                    lines: {
                        test: {
                            input() {},
                            output() {},
                            layout: {
                                action: {
                                    handler() {}
                                }
                            }
                        }
                    }
                }
            }
        })
        expect(() => {
            packhouse.line('test', 'test')().action(() => {})
        }).to.throw(Error)
    })

    it('line layout can\'t promise', function() {
        let packhouse = new Packhouse()
        packhouse.addGroup('test', () => {
            return {
                data: {
                    lines: {
                        test: {
                            input() {},
                            output() {},
                            layout: {
                                promise: {
                                    handler() {}
                                }
                            }
                        }
                    }
                }
            }
        })
        expect(() => {
            packhouse.line('test', 'test')().action(() => {})
        }).to.throw(Error)
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

    it('use line mold error', function(done) {
        this.packhouse
            .line('demoGroup', 'math')('110')
            .add(10)
            .double()
            .action((e, r) => {
                expect(e.error instanceof Error).to.equal(true)
                done()
            })
    })

    it('use line output error', function(done) {
        this.packhouse
            .line('demoGroup', 'outputError')()
            .action((e, r) => {
                expect(e).to.equal('test')
                done()
            })
    })

    it('use line layout error', function(done) {
        this.packhouse
            .line('demoGroup', 'math')(10)
            .setError('error')
            .add(10)
            .action((e, r) => {
                expect(e).to.equal('error')
                done()
            })
    })

    it('use line promise', function(done) {
        this.packhouse
            .line('demoGroup', 'math')(5)
            .add(10)
            .double()
            .promise()
            .then((reslut) => {
                expect(reslut).to.equal(30)
                done()
            })
    })

    it('use line error', function(done) {
        this.packhouse
            .line('demoGroup', 'math')(5)
            .add('10')
            .double()
            .action((e, r) => {
                expect(typeof e.error.message).to.equal('string')
                done()
            })
    })

    it('use line error promise', function(done) {
        this.packhouse
            .line('demoGroup', 'math')(5)
            .add('10')
            .double()
            .promise()
            .catch((e) => {
                expect(typeof e.error.message).to.equal('string')
                done()
            })
    })

    it('use line no return', function(done) {
        try {
            this.packhouse
                .tool('demoGroup', 'toolCantReturn')
                .action((e, r) => {})
        } catch (error) {
            done()
        }
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

    it('coop line', function(done) {
        this.packhouse
            .tool('demoGroup', 'coopLine')
            .action('b', (e, r) => {
                expect(r).to.equal('table - 123b')
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

    it('event error', function() {
        let packhouse = new Packhouse()
        expect(() => {
            packhouse.on('run', '123')
        }).to.throw(Error)
        expect(() => {
            packhouse.off('run', '12131')
        }).to.throw(Error)
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
                expect(typeof detail.result.error.message).to.equal('string')
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

    it('plugin', function(done) {
        this.packhouse
            .plugin(class {
                constructor(packhouse) {
                    expect(typeof packhouse.utils.generateId()).to.equal('string')
                    done()
                }
            })
    })

    it('plugin', function(done) {
        this.packhouse
            .plugin(class {
                constructor(packhouse) {
                    expect(typeof packhouse.utils.generateId()).to.equal('string')
                    done()
                }
            })
    })

    it('global', function(done) {
        Packhouse
            .plugin(class {
                constructor(packhouse) {
                    expect(typeof packhouse.utils.generateId()).to.equal('string')
                    Packhouse._plugins = []
                    done()
                }
            })
        new Packhouse()
    })

    it('promise', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .promise(10, 20)
            .then((result) => {
                expect(result).to.equal(30)
                done()
            })
    })

    it('promise error', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .promise(10, '20')
            .catch((error) => {
                expect(typeof error.error.message).to.equal('string')
                done()
            })
    })

    it('promise error with ng', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .noGood(() => {})
            .promise(10, '20')
            .then(result => {
                expect(typeof result.error.message).to.equal('string')
                done()
            })
    })

    it('promise error with ng and reject', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .noGood(() => {}, { reject: true })
            .promise(10, '20')
            .catch(result => {
                expect(typeof result.error.message).to.equal('string')
                done()
            })
    })

    it('promise error with ng and done ng', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .noGood((result) => {
                expect(typeof result.error.message).to.equal('string')
                done()
            })
            .promise(10, '20')
    })

    it('promise error with ng and done always', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .always(({ result, success }) => {
                expect(typeof result.error.message).to.equal('string')
                expect(success).to.equal(false)
                done()
            })
            .noGood(() => {})
            .promise(10, '20')
    })

    it('promise with always', function(done) {
        this.packhouse
            .tool('demoGroup', 'sum')
            .always(({ result, success }) => {
                expect(result).to.equal(30)
                expect(success).to.equal(true)
                done()
            })
            .promise(10, 20)
    })
})

describe('#Utils', () => {
    it('utils : peel', function() {
        var test = {
            a: {
                c: 5
            }
        }
        expect(Packhouse.utils.peel(test, 'a.c')).to.equal(5)
        expect(Packhouse.utils.peel(test, 'a.b.e.e')).to.equal(undefined)
        expect(Packhouse.utils.peel(test, 'a.b.e.e', '*')).to.equal('*')
    })

    it('utils : verify', function() {
        let options = {
            a: 5,
            b: '7'
        }
        let reslut = Packhouse.utils.verify(options, {
            a: [true, ['number']],
            b: [true, ['string']]
        })
        expect(reslut.a).to.equal(5)
        expect(reslut.b).to.equal('7')
        expect(() => {
            Packhouse.utils.verify(options, {
                a: [true, ['number']],
                b: [true, ['string']],
                c: [true, ['string']]
            })
        }).to.throw(Error)
        expect(() => {
            Packhouse.utils.verify(options, {
                a: [123, ['number']]
            })
        }).to.throw(Error)
        expect(() => {
            Packhouse.utils.verify(options, {
                a: [true, 123]
            })
        }).to.throw(Error)
        expect(() => {
            Packhouse.utils.verify(options, {
                a: [true, ['string']]
            })
        }).to.throw(Error)
    })

    it('getType', function() {
        expect(Packhouse.utils.getType('')).to.equal('string')
        expect(Packhouse.utils.getType(true)).to.equal('boolean')
        expect(Packhouse.utils.getType([])).to.equal('array')
        expect(Packhouse.utils.getType(null)).to.equal('empty')
        expect(Packhouse.utils.getType(undefined)).to.equal('empty')
        expect(Packhouse.utils.getType({})).to.equal('object')
        expect(Packhouse.utils.getType(new Promise(() => {}))).to.equal('promise')
        expect(Packhouse.utils.getType(/www/)).to.equal('regexp')
        expect(Packhouse.utils.getType(Buffer.from([]))).to.equal('buffer')
        expect(Packhouse.utils.getType(Number('AAAA'))).to.equal('NaN')
        expect(Packhouse.utils.getType(new Error('123'))).to.equal('error')
    })
})

describe('#Other', () => {
    it('system error', function() {
        let Base = require('../src/Base')
        let base = new Base('Test')
        expect(() => {
            base.$systemError('Test', 'Test')
        }).to.throw(Error)
        expect(() => {
            base.$systemError('Test', 'Test', 'Test')
        }).to.throw(Error)
        expect(() => {
            base.$devError('Test', 'Test', 'Test')
        }).to.throw(Error)
        expect(() => {
            base.$devError('Test', 'Test')
        }).to.throw(Error)
    })
})
