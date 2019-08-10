const Base = require('./Base')

class MoldStore {}

class Box extends Base {
    constructor(parent, namespace) {
        super('MoldBox')
        this.molds = {}
        this.caches = {}
        this.parent = parent
        this.namespace = namespace || ''
        this.check = (text, source) => {
            let { name, extras } = this.cache(text)
            return this.get(name).check(source, this.getContext(0, extras))
        }
    }

    has(name) {
        if (!!this.molds[name]) {
            return true
        }
        if (this.parent && this.parent.has(this.namespace + name)) {
            return true
        }
        if (this.parent && this.parent.has(name)) {
            return true
        }
        return false
    }

    get(name) {
        if (this.has(name) === false) {
            this.$systemError('get', `Mold(${name}) not found.`)
        }
        if (this.molds[name]) {
            return this.molds[name]
        }
        if (this.parent.has(this.namespace + name)) {
            return this.parent.get(this.namespace + name)
        }
        if (this.parent.has(name)) {
            return this.parent.get(name)
        }
    }

    add(name, options) {
        if (this.molds[name]) {
            this.$systemError('add', `Name(${name}) already exists.`)
        }
        this.molds[name] = new Mold(options)
    }

    cache(text) {
        if (this.caches[text] == null) {
            let data = text.split('|')
            let name = data.shift()
            let extras = {}
            for (let text of data) {
                let [key, value] = text.split(':')
                if (value !== 'undefined') {
                    extras[key] = value === undefined ? true : value
                }
            }
            this.caches[text] = { name, extras }
        }
        return this.caches[text]
    }

    parse(text, source, index, callback) {
        let { name, extras } = this.cache(text)
        return this.get(name).parse(source, this.getContext(index, extras), callback)
    }

    getContext(index, extras) {
        return {
            index,
            check: this.check,
            extras
        }
    }
}

class Mold extends Base {
    constructor(options = {}) {
        super('Mold')
        this.case = new MoldStore()
        this.options = this.$verify(options, {
            check: [false, ['function'], function() { return true }],
            casting: [false, ['function'], function(source) { return source }]
        })
    }

    check(source, context) {
        return this.options.check.call(this.case, source, context)
    }

    casting(source, context) {
        return this.options.casting.call(this.case, source, context)
    }

    parse(source, context, callback) {
        let check = this.check(source, context)
        let value = null
        if (check === true) {
            check = null
            value = this.casting(source, context)
        }
        callback(check, value)
    }
}

module.exports = Box
