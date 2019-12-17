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
    },
    lines: {
        math: {
            input(self, value) {
                self.store.value = value
                self.success()
            },
            output(self) {
                self.success(self.store.value)
            },
            layout: {
                add: {
                    handler(self, value) {
                        self.store.value += value
                        self.success()
                    }
                },
                double: {
                    handler(self) {
                        self.store.value *= 2
                        self.success()
                    }
                }
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
            options.request = ['string', 'string']
            options.handler = self => self.success(50)
        })
        packhouse.tool('math/sam').action('10', '20', (error, result) => {
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
    it('mock line', function(done) {
        packhouse.test.mock('line', 'math/math', options => {
            options.output = self => self.success(self.store.value * 2)
            options.layout.double.handler = self => {
                self.store.value *= 3
                self.success()
            }
        })
        packhouse
            .line('math/math')(10)
            .add(5)
            .double()
            .action((err, result) => {
                expect(result).to.equal(90)
                done()
            })
    })
    it('restore line', function(done) {
        packhouse.test.restore('line', 'math/math')
        packhouse
            .line('math/math')(10)
            .add(5)
            .double()
            .action((err, result) => {
                expect(result).to.equal(30)
                done()
            })
    })
    it('restoreAll', function() {
        packhouse.test.mock('tool', 'math/sam', options => {
            options.request = ['string', 'string']
            options.handler = self => self.success(50)
        })
        packhouse.test.mock('line', 'math/math', options => {
            options.output = self => self.success(self.store.value * 2)
            options.layout.double.handler = self => {
                self.store.value *= 3
                self.success()
            }
        })
        packhouse.test.restoreAll()
        packhouse.tool('math/sam').action(10, 20, (error, result) => {
            expect(result).to.equal(30)
        })
        packhouse
            .line('math/math')(10)
            .add(5)
            .double()
            .action((err, result) => {
                expect(result).to.equal(30)
            })
    })
})
