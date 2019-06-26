const expect = require('chai').expect
const Packhouse = require('../src/Main')

describe('#Order', () => {
    before(function() {})
    it('base test', function() {
        let base = 2
        let test1 = 0
        let test2 = 0
        let finish = 0
        let order = Packhouse.createOrder()
        let error = () => {}
        order.getOrCreat('test').buffer(error, (result) => {
            base = 5
            test1 = result
        }).finish((cache) => {
            finish += 1
        }).action((error, success) => {
            success(base)
        })
        order.getOrCreat('test').buffer(error, (result) => {
            test2 = result
        })
        expect(test1).to.equal(2)
        expect(test2).to.equal(2)
        expect(finish).to.equal(1)
        order.getOrCreat('test').clear().buffer(error, (result) => { test2 = result }).action((error, success) => {
            success(base)
        })
        expect(test2).to.equal(5)
        expect(order.has('test')).to.equal(true)
        expect(order.has('fail')).to.equal(false)
        order.clear()
        expect(order.has('test')).to.equal(false)
    })

    it('use and remove', function() {
        let test = 0
        let order = Packhouse.createOrder()
        let error = () => {}
        let success = (result) => { test = result }
        order.use('test', error, success, (error, success) => {
            success(2)
        })
        expect(test).to.equal(2)
        expect(order.has('test')).to.equal(true)
        order.remove('test')
        expect(order.has('test')).to.equal(false)
    })
})
