const Base = require('./Base')
const Utils = require('./Utils')

class Event extends Base {
    constructor(caller) {
        super('Event')
        this.caller = caller
        this.channels = {}
    }

    addChannel(name) {
        this.channels[name] = new Channel(this)
    }

    getChannel(name) {
        if (this.channels[name] == null) {
            this.addChannel(name)
        }
        return this.channels[name]
    }

    on(channelName, callback) {
        return this.getChannel(channelName).addListener(callback)
    }

    off(channelName, id) {
        this.getChannel(channelName).removeListener(id)
    }

    emit(channelName, data) {
        this.getChannel(channelName).broadcast(data)
    }
}

class Channel extends Base {
    constructor(event) {
        super('Channel')
        this.event = event
        this.listeners = {}
    }

    checkListener(id) {
        if (this.listeners[id] == null) {
            this.$devError('checkListener', `Listener id(${id}) not found.`)
        }
    }

    addListener(callback) {
        if (typeof callback !== 'function') {
            this.$devError('addListener', 'Callback must be a function', callback)
        }
        let id = Utils.generateId()
        this.listeners[id] = callback
        return id
    }

    removeListener(id) {
        this.checkListener(id)
        delete this.listeners[id]
    }

    broadcast(data) {
        for (let id in this.listeners) {
            this.listeners[id].call(this.event.caller, { id }, data)
        }
    }
}

module.exports = Event
