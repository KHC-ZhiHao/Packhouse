const expect = require('chai').expect
const Packhouse = require('../src/Main')

describe('#Pump', () => {
    it('press', function() {
        let success = false
        let pump = Packhouse.createPump(2, () => { success = true })
        pump.press()
        pump.press()
        expect(success).to.equal(true)
    })
    it('over press', function() {
        let success = false
        let pump = Packhouse.createPump(3, () => { success = true })
        pump.press()
        pump.press()
        expect(success).to.equal(false)
    })
    it('add', function() {
        let success = false
        let pump = Packhouse.createPump(2, () => { success = true })
        pump.add(2)
        pump.press()
        pump.press()
        expect(success).to.equal(false)
        pump.press()
        pump.press()
        expect(success).to.equal(true)
    })
    it('each', function() {
        let count = 0
        let pump = Packhouse.createPump(5, () => {})
        pump.each((press, index) => {
            expect(index).to.equal(count)
            count += 1
            press()
        })
    })
    it('each last count', function() {
        let count = 1
        let pump = Packhouse.createPump(5, () => {})
        pump.press()
        pump.each((press, index) => {
            expect(index).to.equal(count)
            count += 1
            press()
        })
    })
})
