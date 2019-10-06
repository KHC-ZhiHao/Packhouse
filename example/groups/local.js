const Packhouse = require('packhouse')

const group = Packhouse.groupFormat({
    mergers: {
        weather: 'OpenData@weather',
        rainfall: 'OpenData@rainfall'
    }
})

group.tools.getWeather = {
    request: ['number', 'number'],
    install({ include }) {
        include('getData').coop('weather', 'tool', 'getLocalByNearGeo')
    },
    handler(longitude, latitude) {
        this.use('getData')
            .noGood(this.error)
            .action(longitude, latitude, this.success)
    }
}

group.tools.getRainfall = {
    request: ['number', 'number'],
    install({ include }) {
        include('getData').coop('rainfall', 'tool', 'getLocalByNearGeo')
    },
    handler(longitude, latitude) {
        this.use('getData')
            .noGood(this.error)
            .action(longitude, latitude, this.success)
    }
}

module.exports = group
