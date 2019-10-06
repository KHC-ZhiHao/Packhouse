let Step = require('packhouse/plugins/Step')
let Order = require('packhouse/plugins/Order')
let Packhouse = require('packhouse')

module.exports = function() {
    let packhouse = new Packhouse()
    packhouse.plugin(Step)
    packhouse.plugin(Order)
    packhouse.add('Local', () => {
        return {
            data: require('./groups/local')
        }
    })
    packhouse.merger('OpenData', require('./mergers/opendata'), {
        weather: {
            baseUrl: 'https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0002-001?Authorization=rdec-key-123-45678-011121314&format=JSON'
        },
        rainfall: {
            baseUrl: 'https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/O-A0001-001?Authorization=rdec-key-123-45678-011121314&format=JSON'
        }
    })
    return packhouse
}
