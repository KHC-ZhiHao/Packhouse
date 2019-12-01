const Order = require('../plugins/Order')
const Packhouse = require('../src/Packhouse')
const group = require('./group')
const expect = require('chai').expect

describe('#Order', () => {
    before(function() {
        this.packhouse = new Packhouse()
        this.packhouse.plugin(Order)
        this.packhouse.addGroup('demoGroup', () => {
            return {
                data: group
            }
        })
    })
    it('Normal', function(done) {
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
    it('Remove', function(done) {
        let time = Date.now()
        let tool = this.packhouse.tool('demoGroup', 'orderTest')
        tool.action('1234', () => {
            let nextTime = Date.now()
            expect(nextTime - time > 50).to.equal(true)
            tool._core.tool.store.order.remove('1234')
            expect(() => {
                tool._core.tool.store.order.remove('12344')
            }).to.throw(Error)
            this.packhouse
                .tool('demoGroup', 'orderTest')
                .action('1234', () => {
                    let newNextTime = Date.now()
                    expect(newNextTime - nextTime > 50).to.equal(true)
                    done()
                })
        })
    })
    it('Has', function(done) {
        let tool = this.packhouse.tool('demoGroup', 'orderTestLite')
        tool.action('1234', () => {
            expect(tool._core.tool.store.order.has('1234')).to.equal(true)
            expect(tool._core.tool.store.order.has('12344')).to.equal(false)
            expect(() => {
                tool._core.tool.store.order.has(1234)
            }).to.throw(Error)
            tool._core.tool.store.order.clear()
            expect(tool._core.tool.store.order.has('1234')).to.equal(false)
            done()
        })
    })
    it('Use', function(done) {
        let time = Date.now()
        this.packhouse
            .tool('demoGroup', 'orderTestForUse')
            .action('123', () => {
                let nextTime = Date.now()
                expect(nextTime - time > 50).to.equal(true)
                this.packhouse
                    .tool('demoGroup', 'orderTestForUse')
                    .action('123', () => {
                        let newNextTime = Date.now()
                        expect(newNextTime - nextTime > 50).to.equal(false)
                        done()
                    })
            })
    })
    it('UseError', function(done) {
        let time = Date.now()
        this.packhouse
            .tool('demoGroup', 'orderTestForUseAndError')
            .action('123', (error) => {
                let nextTime = Date.now()
                expect(nextTime - time > 50).to.equal(true)
                expect(error).to.equal('123')
                this.packhouse
                    .tool('demoGroup', 'orderTestForUseAndError')
                    .action('123', () => {
                        let newNextTime = Date.now()
                        expect(newNextTime - nextTime > 50).to.equal(false)
                        done()
                    })
            })
    })
})
