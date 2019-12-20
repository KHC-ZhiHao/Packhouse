const Base = require('./Base')
const Utils = require('./Utils')

class Box extends Base {
    constructor(parent, namespace) {
        super('MoldBox')
        this.molds = new Map()
        this.caches = new Map()
        this.parent = parent
        this.namespace = namespace || ''
    }

    has(name) {
        if (this.molds.has(name)) {
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
        if (this.molds.has(name)) {
            return this.molds.get(name)
        }
        if (this.parent.has(this.namespace + name)) {
            return this.parent.get(this.namespace + name)
        }
        if (this.parent.has(name)) {
            return this.parent.get(name)
        }
        this.$devError('get', `Mold(${name}) not found.`)
    }

    add(name, handler) {
        if (this.molds.has(name)) {
            this.$devError('add', `Name(${name}) already exists.`)
        }
        this.molds.set(name, new Mold(handler))
    }

    cache(text) {
        if (this.caches.has(text) === false) {
            let data = text.split('|')
            let name = data.shift()
            let extras = {}
            let isRequire = false
            if (name.slice(-1) === '?') {
                name = name.slice(0, -1)
                isRequire = true
            }
            for (let text of data) {
                let [key, value] = text.split(':')
                if (value !== 'undefined') {
                    extras[key] = value === undefined ? true : value
                }
            }
            this.caches.set(text, { name, extras, isRequire })
        }
        return this.caches.get(text)
    }

    parse(text, source, index, message) {
        let { name, extras, isRequire } = this.cache(text)
        return this.get(name).parse(source, this.getContext(index, extras), message, isRequire)
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
        this.case = {}
        if (typeof handler === 'function') {
            this.handler = handler
        } else {
            this.handler = (value, { index }) => {
                try {
                    return Utils.verify(value, handler)
                } catch (error) {
                    throw new Error(`Parameter ${index} verification error, ${error.message}`)
                }
            }
        }
    }

    parse(source, context, message, isRequire) {
        context.utils = Utils
        context.message = message
        return source == null && isRequire === true ? source : this.handler.call(this.case, source, context)
    }
}

module.exports = Box
