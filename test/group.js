const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Group = require('./fake/group')
const Merger = require('./fake/merger')

describe('#Group', () => {
    before(function() {
        this.factory = Packhouse.createFactory()
        this.factory.addGroup('test', Group, {})
        this.factory.addGroup('merger_test', Merger, {})
    })
    it('mergers', function() {
        
    })
})
