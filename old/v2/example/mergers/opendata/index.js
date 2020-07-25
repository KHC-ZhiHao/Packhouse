module.exports = {
    groups: {
        weather({ weather }) {
            return {
                data: require('./weather'),
                options: weather
            }
        },
        rainfall({ rainfall }) {
            return {
                data: require('./rainfall'),
                options: rainfall
            }
        }
    }
}
