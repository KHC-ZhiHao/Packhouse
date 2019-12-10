const packhouse = require('./packhouse')

module.exports = (template) => async(event = {}) => {
    let ph = packhouse()
    let result = await ph.step({
        create(self) {
            self.ph = ph
            self.result = {}
            self.latitude = event.latitude || 0
            self.longitude = event.longitude || 0
            self.errorMessage = null
            self.error = error => {
                self.errorMessage = error
            }
        },
        middle(self, { exit }) {
            if (self.errorMessage) {
                exit()
            }
        },
        output(self, { history }, success) {
            console.log(history.toJSON(true, {
                result: self.result,
                errorMessage: self.errorMessage
            }))
            success({
                statusCode: self.errorMessage ? 500 : 200,
                body: JSON.stringify(self.errorMessage || self.result)
            })
        },
        timeout: 25000,
        template
    })
    return result
}
