const Step = require('../plugins/Step')
const Packhouse = require('../src/Packhouse')

const expect = require('chai').expect
const group = require('./group')

describe('#Step', () => {
    it('success', function(done) {
        let template = [
            function(self, next) {
                next()
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.step({
            template,
            timeout: 10000,
            output(self, context, success) {
                success('123')
            }
        }).then((result) => {
            expect(result).to.equal('123')
            done()
        })
    })

    it('error', function(done) {
        let template = [
            function(self, next) {
                next()
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.step({
            template,
            output(self, context, success, error) {
                error('123')
            }
        })
            .catch((result) => {
                expect(result).to.equal('123')
                done()
            })
    })

    it('success & error', function(done) {
        let template = [
            function(self, next) {
                next()
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.step({
            template,
            output(self, context, success, error) {
                success('123')
                error('123')
            }
        })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
            .catch(() => {
                done('error')
            })
    })

    it('timeout', function(done) {
        let template = [
            function() {}
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.step({
            template,
            timeout: 10,
            output(self, { timeout }, success) {
                expect(timeout).to.equal(true)
                success()
            }
        })
            .then(done)
    })

    it('timeout error', function(done) {
        let template = [
            function() {}
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.step({
            template,
            timeout: 10,
            output(self, { timeout }, success, error) {
                expect(timeout).to.equal(true)
                error()
            }
        })
            .catch(done)
    })

    it('history', function(done) {
        let template = [
            function test(self, next) {
                packhouse.tool('demo/includeTest').action(10, 20, () => {
                    next()
                })
            },
            function(self, next) {
                packhouse.tool('demo/get').action(123, () => {
                    next()
                })
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.addGroup('demo', () => {
            return {
                data: group
            }
        })
        packhouse.merger('aws', require('./merger/aws/index.js'))
        packhouse.step({
            template,
            output(self, { history }, success, error) {
                expect(typeof history.toJSON()).to.equal('string')
                expect(typeof history.toJSON(true)).to.equal('string')
                expect(history.isDone('test')).to.equal(true)
                expect(history.isDone('testy')).to.equal(false)
                success('123')
            }
        })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })

    it('history error', function(done) {
        let template = [
            function(self, next) {
                packhouse
                    .tool('demo/get')
                    .action(123, () => {
                        next()
                    })
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.addGroup('demo', () => {
            return {
                data: group
            }
        })
        packhouse.merger('aws', require('./merger/aws/index.js'))
        packhouse.step({
            template,
            output(self, { history }, success, error) {
                let key = Object.keys(history.template[0].logs)[0]
                expect(typeof history.template[0].logs[key].result).to.equal('object')
                success('123')
            }
        })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })

    it('step of line', function(done) {
        let template = [
            function(self, next) {
                packhouse
                    .tool('demo/coopLine')
                    .action('b', (e, r) => {
                        this.result = r
                        next()
                    })
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.addGroup('demo', () => {
            return {
                data: group
            }
        })
        packhouse.merger('aws', require('./merger/aws/index.js'))
        packhouse.step({
            template,
            output(self, { history }, success) {
                expect(typeof history.toJSON(true)).to.equal('string')
                success('123')
            }
        })
            .then((result) => {
                expect(result).to.equal('123')
                done()
            })
    })

    it('fail', function(done) {
        let template = [
            function(self, next, { fail }) {
                fail('fail')
            }
        ]
        let packhouse = new Packhouse()
        packhouse.plugin(Step)
        packhouse.step({
            template,
            output(self, { fail }, success) {
                expect(fail).to.equal(true)
                success()
            }
        }).then(done)
    })

    it('inspect', function(done) {
        let template = [
            function(self, next) {
                next()
            }
        ]
        let packhouse = new Packhouse()
        let circular = {
            circular2: {}
        }
        circular.circular2 = circular
        packhouse.plugin(Step)
        packhouse.step({
            template,
            output(self, { history }, success) {
                expect(typeof history._core.inspect({
                    fun: function() {},
                    buf: Buffer.from([]),
                    promise: new Promise(() => {}),
                    nan: Number('OuO'),
                    regexp: /qqq/,
                    error: new Error(),
                    circular: circular
                })).to.equal('object')
                expect(history._core.inspect(null)).to.equal(null)
                success()
            }
        }).then(done)
    })
})
