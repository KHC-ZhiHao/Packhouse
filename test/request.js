let Packhouse = require('../dist/index')
let group = new Packhouse.Group({
    create() {}
})

group.addTools([
    {
        name: 'sendBase',
        molds: ['string'],
        paramLength: 2,
        allowDirect: false,
        create: function(store, system) {
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
            this.order = Packhouse.createOrder()
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
    }
])

module.exports = group
