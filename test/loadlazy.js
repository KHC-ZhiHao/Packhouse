const LazyLoad = require('../plugins/LazyLoad')
const Packhouse = require('../src/Main')

const expect = require('chai').expect
let packhouse = new Packhouse()

packhouse.plugin(LazyLoad, {
    group: name => require(`./group/${name}`),
    merger: sign => require(`./merger/${sign}`),
    groupOptions: {},
    mergerOptions: {}
})

describe('#Loadlazy', () => {
    it('group', function(done) {
        packhouse
            .tool('index', 'sum')
            .action(10, 20, (err, result) => {
                expect(result).to.equal(30)
                done()
            })
    })
    it('group has', function(done) {
        packhouse
            .tool('index', 'sum')
            .action(10, 20, (err, result) => {
                expect(result).to.equal(30)
                done()
            })
    })
    it('merger', function(done) {
        packhouse
            .tool('aws@dynamoDB', 'get')
            .action('test', '123', (err, result) => {
                expect(result).to.equal('table - test123')
                done()
            })
    })
})
