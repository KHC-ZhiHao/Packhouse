const group = {
    tools: {},
    molds: {},
    lines: {},
    mergers: {
        weather: 'OpenData@weather',
        rainfall: 'OpenData@rainfall'
    }
}

group.tools.getWeather = {
    request: ['number', 'number'],
    install({ include }) {
        include('getData').coop('weather', 'tool', 'getLocalByNearGeo')
    },
    handler(self, longitude, latitude) {
        self.use('getData')
            .noGood(self.error)
            .action(longitude, latitude, self.success)
    }
}

group.tools.getRainfall = {
    request: ['number', 'number'],
    install({ include }) {
        include('getData').coop('rainfall', 'tool', 'getLocalByNearGeo')
    },
    handler(self, longitude, latitude) {
        self.use('getData')
            .noGood(self.error)
            .action(longitude, latitude, self.success)
    }
}

module.exports = group
