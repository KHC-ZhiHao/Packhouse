const Packhouse = require('../src/Main')
const expect = require('chai').expect

describe('#Step', () => {
    it('step', async function() {
        let count = 1
        const step = Packhouse.createStep({
            input(args, options, { exit, fail }) {},
            middle(context) {},
            output({ success, message }) {}
        })
        let test = step.generator({
            templates: [
                async function validate(next) {
                    count += 1
                    next()
                },
                async function get_data(next) {
                    count *= 2
                    next()
                }
            ]
        })
        await test()
        expect(count).to.equal(4)
    })
    it('step timeout', async function() {
        let error = ''
        const step = Packhouse.createStep({
            timeout: 100,
            input(args, options, { exit, fail }) {},
            middle(context) {},
            output({ success, message }) {
                error = message
            }
        })
        let test = step.generator({
            templates: [
                async function dead(next) {}
            ]
        })
        await test()
        expect(error).to.equal('timeout')
    })
    it('step exit', async function() {
        let meg = ''
        let result = false
        const step = Packhouse.createStep({
            input(args, options, { exit, fail }) {},
            middle(context) {},
            output({ success, message }) {
                meg = message
                result = success
            }
        })
        let test = step.generator({
            templates: [
                async function dead(next, { exit }) {
                    exit('ouo')
                },
                async function dead(next, { exit }) {
                    exit('=_=')
                }
            ]
        })
        await test()
        expect(meg).to.equal('ouo')
        expect(result).to.equal(true)
    })
    it('step fail', async function() {
        let meg = ''
        let result = true
        const step = Packhouse.createStep({
            input(args, options, { exit, fail }) {},
            middle(context) {},
            output({ success, message }) {
                meg = message
                result = success
            }
        })
        let test = step.generator({
            templates: [
                async function dead(next, { exit, fail }) {
                    fail('ouo')
                },
                async function dead(next, { exit }) {
                    exit('=_=')
                }
            ]
        })
        await test()
        expect(meg).to.equal('ouo')
        expect(result).to.equal(false)
    })
    it('addon', async function() {
        let meg = ''
        let result = true
        const step = Packhouse.createStep({
            addon(templates, options) {
                return [
                    async function test() {
                        
                    }
                ].concat(templates)
            },
            input(args, options, { exit, fail }) {},
            middle(context) {},
            output({ success, message }) {
                meg = message
                result = success
            }
        })
        let test = step.generator({
            templates: [
                async function dead(next, { exit, fail }) {
                    fail('ouo')
                },
                async function dead(next, { exit }) {
                    exit('=_=')
                }
            ]
        })
        await test()
        expect(meg).to.equal('ouo')
        expect(result).to.equal(false)
    })
})
