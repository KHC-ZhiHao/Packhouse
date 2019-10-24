const request = require('request')
const group = {
    tools: {},
    molds: {},
    lines: {},
    install(group, { baseUrl }) {
        group.baseUrl = baseUrl
    }
}

// ===================
//
// Utils
//

function getGeoDistance(lat1, lng1, lat2, lng2) {
    let rad = Math.PI / 180
    let radLat1 = lat1 * rad
    let radLat2 = lat2 * rad
    let a = radLat1 - radLat2
    let b = lng1 * rad - lng2 * rad
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
    return Math.round((s * 6378.137) * 10000) / 10000
}

// ===================
//
// Molds
//

group.molds.location = function(value) {
    let weather = {}
    for (let element of value.weatherElement) {
        let value = Number(element.elementValue.value)
        if (value === -998) {
            weather[element.elementName] = null
            continue
        }
        weather[element.elementName] = value
    }
    return {
        lat: Number(value.lat),
        lon: Number(value.lon),
        name: value.locationName,
        time: value.time.obsTime,
        weather
    }
}

// ===================
//
// Tools
//

group.tools.getData = {
    install({ store, group, utils }) {
        store.order = utils.order()
        store.baseUrl = group.baseUrl
    },
    handler(self) {
        self.store
            .order
            .use('cache', self, (error, success) => {
                request.get(self.store.baseUrl, (err, response, body) => {
                    if (err) {
                        error(err)
                    } else {
                        success(JSON.parse(body))
                    }
                })
            })
    }
}

group.tools.getLocalByNearGeo = {
    request: ['number', 'number'],
    response: 'location',
    install({ include }) {
        include('getData').tool('getData')
    },
    handler(self, longitude, latitude) {
        let target = null
        let minDistance = -1000000
        self.use('getData')
            .noGood(self.error)
            .action(data => {
                let items = data.cwbopendata.location
                for (let item of items) {
                    let lat = Number(item.lat)
                    let lon = Number(item.lon)
                    let distance = getGeoDistance(latitude, longitude, lat, lon)
                    if (distance > minDistance) {
                        target = item
                        minDistance = distance
                    }
                }
                self.success(target)
            })
    }
}

module.exports = group
