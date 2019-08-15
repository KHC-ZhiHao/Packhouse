const expect = require('chai').expect
const Packhouse = require('../src/Main')

describe('#Frag', () => {
    it('normal', function(done) {
        let count = 0
        let frag = Packhouse.createFrag(1)
        frag.add((done) => {
            count += 1
            done()
        })
        frag.add((done) => {
            count += 1
            done()
        })
        frag.start(() => {
            expect(count).to.equal(2)
            done()
        })
    })
    it('real', function(done) {
        let now = Date.now()
        let count = 0
        let frag = Packhouse.createFrag({
            limit: 2
        })
        frag.add((done) => {
            count += 1
            setTimeout(done, 100)
        })
        frag.add((done) => {
            count += 1
            setTimeout(done, 100)
        })
        frag.add((done) => {
            count += 1
            setTimeout(done, 100)
        })
        frag.start(() => {
            let total = Date.now() - now
            expect(count).to.equal(3)
            expect(total < 300).to.equal(true)
            done()
        })
    })
    it('all', function(done) {
        let count = 0
        let frag = Packhouse.createFrag()
        frag.add((done) => {
            count += 1
            done()
        })
        frag.add((done) => {
            count += 1
            done()
        })
        frag.start(() => {
            expect(count).to.equal(2)
            done()
        })
    })
    it('stop', function(done) {
        let count = 0
        let frag = Packhouse.createFrag()
        frag.add((done, stop) => {
            count += 1
            stop()
        })
        frag.add((done) => {
            setTimeout(() => {
                count += 1
                done()
            }, 10)
        })
        frag.start(() => {
            expect(count).to.equal(1)
            done()
        })
    })
})
