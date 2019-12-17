const Test = require('../plugins/Test')
const Packhouse = require('../src/Packhouse')
const expect = require('chai').expect

let packhouse = new Packhouse()
let group = {
    tools: {
        sam: {
            handler(self, v1, v2) {
                self.success(v1 + v2)
            }
        }
    }
}
packhouse.addGroup('math', () => {
    return {
        data: group
    }
})
packhouse.plugin(Test)

describe('#Test', (done) => {
    it('mock', function(done) {
        packhouse.test.mock('tool', 'math/sam', options => {
            options.handler = self => self.success(50)
        })
        packhouse.tool('math/sam').action(10, 20, (error, result) => {
            expect(result).to.equal(50)
            done()
        })
    })
    it('restore', function(done) {
        packhouse.test.restore('tool', 'math/sam')
        packhouse.tool('math/sam').action(10, 20, (error, result) => {
            expect(result).to.equal(30)
            done()
        })
    })
    it('mock line', function() {

    })
    it('restore line', function() {

    })
    it('restoreAll', function() {

    })
})
