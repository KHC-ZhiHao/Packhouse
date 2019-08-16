const expect = require('chai').expect
const Packhouse = require('../src/Main')

describe('#Frag', () => {
    it('normal', function(done) {
        let count = 0
        let frag = Packhouse.createFrag(1)
        frag.add((done) => {
            count += 1
            done('1234')
        })
        frag.add((done) => {
            count += 1
            done('1234')
        })
        frag.start((result) => {
            expect(count).to.equal(2)
            expect(result.done[0]).to.equal('1234')
            done()
        })
    })
    it('real', function(done) {
        let now = Date.now()
        let count = 0
        let frag = Packhouse.createFrag({
            parallel: 2
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
    it('each', function(done) {
        let count = 0
        let frag = Packhouse.createFrag()
        frag.each([1, 1, 1, 1, 2], (data, index, done) => {
            count += data + index
            done()
        }).start(() => {
            expect(count).to.equal(16)
            done()
        })
    })
    it('stop', function(done) {
        let count = 0
        let frag = Packhouse.createFrag()
        frag.add((done, stop) => {
            count += 1
            stop('stop')
        })
        frag.add((done) => {
            setTimeout(() => {
                count += 1
                done()
            }, 10)
        })
        frag.start((result) => {
            expect(count).to.equal(1)
            expect(result.stop).to.equal('stop')
            done()
        })
    })
})
