let main = require('./main')

exports.handler = main([
    function getWeather(self, next) {
        this.ph
            .tool('Local/getWeather')
            .noGood(this.error)
            .always(next)
            .action(this.longitude, this.latitude, result => {
                this.result.weather = result
            })
    },
    function getRainfall(self, next) {
        this.ph
            .tool('Local/getRainfall')
            .noGood(this.error)
            .always(next)
            .action(this.longitude, this.latitude, result => {
                this.result.rainfall = result
            })
    }
])
