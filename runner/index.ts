import Tool from '../src/tool'

let getUser = Tool(({ done }) => {
    return {
        request: ['string'],
        handler: (username: string) => {
            done(username)
        }
    }
})

(async() => {
    let user = getUser('dave').on('done', () => {}).on('fail', () => {})
})()
