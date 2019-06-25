const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Factory = require('../src/Factory')
const Pump = require('../src/Pump')

describe('#Main', () => {
    before(function() {})
    it('create factory', function() {
        let factory = Packhouse.createFactory()
        expect(factory instanceof Factory).to.equal(true)
    })
    it('create pump', function() {
        let pump = Packhouse.createPump()
        expect(pump instanceof Pump).to.equal(true)
    })
})
