const Order = require('../plugins/Order')
const Packhouse = require('../src/Main')
const group = require('./group')
const expect = require('chai').expect

describe('#Order', () => {
    before(function() {
        this.packhouse = new Packhouse()
        this.packhouse.plugin(Order)
        this.packhouse.add('demoGroup', () => {
            return {
                data: group
            }
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
})