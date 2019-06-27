const expect = require('chai').expect
const Packhouse = require('../src/Main')
const Group = require('./fake/group')

describe('#Mold', () => {
    before(function() {
        this.factory = Packhouse.createFactory()
        this.factory.addGroup('test', Group)
    })
    it('action', function() {

    })
    it('promise', function() {

    })
    it('recursive', function() {

    })
    it('coop', function() {

    })
    it('tool', function() {

    })
    it('line', function() {

    })
    it('casting', function() {

    })
    it('ng', function() {

    })
    it('sop', function() {

    })
    it('rule', function() {

    })
    it('weld', function() {

    })
    it('clear', function() {

    })
    it('packing', function() {

    })
    it('rePacking', function() {

    })
})
