const group = {}

group.mergers = {
    weather: 'OpenData@weather',
    rainfall: 'OpenData@rainfall'
}

// ===================
//
// Tools
//

group.tools = {
    getWeather: {
        request: ['number', 'number'],
        install({ include }) {
            include('getData').tool('weather/getLocalByNearGeo')
        },
        handler(self, longitude, latitude) {
            self.tool('getData')
                .noGood(self.error)
                .action(longitude, latitude, self.success)
        }
    },

    getRainfall: {
        request: ['number', 'number'],
        install({ include }) {
            include('getData').tool('rainfall/getLocalByNearGeo')
        },
        handler(self, longitude, latitude) {
            self.tool('getData')
                .noGood(self.error)
                .action(longitude, latitude, self.success)
        }
    }
}

module.exports = group
