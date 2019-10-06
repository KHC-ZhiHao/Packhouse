const packhouse = require('./packhouse')

module.exports = (template) => async(event = {}) => {
    let ph = packhouse()
    let result = await ph.step({
        create() {
            this.ph = ph
            this.result = {}
            this.latitude = event.latitude || 0
            this.longitude = event.longitude || 0
            this.errorMessage = null
            this.error = error => {
                this.errorMessage = error
            }
        },
        middle({ exit }) {
            if (this.errorMessage) {
                exit()
            }
        },
        output({ history }, success) {
            console.log(history.toJSON(true, {
                result: this.result,
                errorMessage: this.errorMessage
            }))
            success({
                statusCode: this.errorMessage ? 500 : 200,
                body: JSON.stringify(this.errorMessage || this.result)
            })
        },
        timeout: 25000,
        template
    })
    return result
}
