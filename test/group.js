const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Group = require('./fake/group')

describe('#Factory', () => {
    before(function() {
        this.factory = Packhouse.createFactory()
        this.factory.addGroup('test', Group, {})
    })
    it('add and has group', function() {
    })
})
