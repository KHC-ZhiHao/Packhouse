let Packhouse = require('../dist/Packhouse')

let group = Packhouse.createGroup({
    merger: {
        math: require('./math'),
        math2: () => require('./math')
    },
    create() {
        console.log('request start')
    }
})

group.addTools([
    {
        name: 'sendBase',
        molds: ['string'],
        paramLength: 2,
        allowDirect: false,
        create: function(store, system) {
            this.math = system.coop('math')
            this.math2 = system.coop('math2')
            this.math2.tool('sum').sop(m => {console.log('math2 success')}).direct(10, 20)
            this.request = require('request')
        },
        action: function(method, params, system, error, success) {
            console.log('request')
            this.request[method]({
                ...params,
                rejectUnauthorized: false,
                strictSSL: false
            }, function (err, response, body) {
                if (err) {
                    console.log(error)
                    error(err)
                } else {
                    success(body)
                }
            })
        }
    },
    {
        name: 'send',
        molds: ['string', 'object'],
        updateTime: 4000,
        paramLength: 2,
        allowDirect: false,
        create: function(store, system) {
            this.send = system.include('sendBase')
            this.order = Packhouse.createOrder({
                max: 500
            })
        },
        update: function(store, system) {
            console.log('update success')
            this.order.clear()
        },
        action: function(method, params, system, error, success) {
            let key = method + JSON.stringify(params)
            let cache = this.order.getOrCreate(key).buffer(error, success).onload(cache => cache.post())
            if (cache.isReady() === false) {
                cache.onReady((error, success) => {
                    this.send.ng(error).action(method, params, success)
                })
            }
        }
    },
    {
        name: 'get',
        molds: ['string'],
        paramLength: 2,
        allowDirect: false,
        create: function(store, system) {
            this.send = system.include('send')
        },
        action: function(url, headers, system, error, success) {
            this.send.ng(error).action('get', {
                url,
                headers: headers || { "Content-Type": "application/json;charset=UTF-8" }
            }, success)
        }
    },
    {
        name: 'update',
        paramLength: 2,
        allowDirect: true,
        update: function() {
            console.log('update')
        },
        action: function(url, headers, system, error, success) {
            system.update()
            system.updateCall('send')
        }
    }
])

module.exports = group
