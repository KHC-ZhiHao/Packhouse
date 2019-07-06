const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Factory = require('../src/Factory')
const Order = require('../src/Order')
const Pump = require('../src/Pump')

describe('#Main', () => {
    before(function() {})
    it('create factory', function() {
        let factory = Packhouse.createFactory()
        expect(factory instanceof Factory).to.equal(true)
    })
    it('create pump', function() {
        let pump = Packhouse.createPump(2, () => {})
        expect(pump instanceof Pump).to.equal(true)
    })
    it('create order', function() {
        let order = Packhouse.createOrder()
        expect(order instanceof Order).to.equal(true)
    })
})
