const Base = require('./Base')

class Event extends Base {
    constructor(factory) {
        super('Event')
        this.factory = factory
        this.channels = {}
    }

    addChannel(name) {
        this.channels[name] = []
    }

    on(name, callback) {
        if (this.channels[name] == null) {
            this.$systemError('on', `Channel(${name}) not found.`)
        }
        if (typeof callback !== 'function') {
            this.$systemError('on', `Callback must be a function`, callback)
        }
        this.channels[name].push(callback)
    }

    broadcast(name, context) {
        if (this.channels[name] == null) {
            this.$systemError('on', `Channel(${name}) not found.`)
        }
        for (let callback of this.channels[name]) {
            callback.call(this.factory, {
                name,
                ...context
            })
        }
    }
}

module.exports = Event
