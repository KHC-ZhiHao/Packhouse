const Base = require('./Base')
const Utils = require('./Utils')

class MoldStore {}

class Box extends Base {
    constructor(parent, namespace) {
        super('MoldBox')
        this.molds = {}
        this.caches = {}
        this.parent = parent
        this.namespace = namespace || ''
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
            this.$devError('get', `Mold(${name}) not found.`)
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

    add(name, handler) {
        if (this.molds[name]) {
            this.$devError('add', `Name(${name}) already exists.`)
        }
        this.molds[name] = new Mold(handler)
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
            extras
        }
    }
}

class Mold extends Base {
    constructor(handler) {
        super('Mold')
        this.case = new MoldStore()
        this.handler = handler
    }

    parse(source, context, message) {
        context.utils = Utils
        context.message = message
        return this.handler.call(this.case, source, context)
    }
}

module.exports = Box
