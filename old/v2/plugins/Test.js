function copy(source) {
    if (source == null) {
        return source
    }
    let newData = Array.isArray(source) ? [] : {}
    for (const key in source) {
        let target = source[key]
        newData[key] = (typeof target === 'object') ? copy(target) : target
    }
    return newData
}

class Main {
    constructor(packhouse) {
        let caches = []
        let getGroup = name => {
            return packhouse._core.getGroup(name)
        }
        let parseName = name => {
            let [group, tool] = name.split('/')
            return { group, tool }
        }
        let getCache = (type, name) => {
            for (let cache of caches) {
                if (cache.type === type && cache.name === name) {
                    return cache
                }
            }
        }
        packhouse.test = {
            mock: (type, name, callback) => {
                if (getCache(type, name)) {
                    throw new Error(`${type}, ${name} already mock.`)
                }
                let result = parseName(name)
                let group = getGroup(result.group)
                let target = type === 'tool' ? group.getTool(result.tool) : group.getLine(result.tool)
                let options = target.options
                let clone = copy(options)
                callback(clone)
                target.options = clone
                caches.push({
                    type,
                    name,
                    target,
                    options
                })
            },
            restore: (type, name) => {
                let cache = getCache(type, name)
                if (cache) {
                    cache.target.options = cache.options
                    caches.splice(caches.indexOf(cache), 1)
                } else {
                    throw new Error(`Target(${type}, ${name}) no mock.`)
                }
            },
            restoreAll: () => {
                for (let cache of caches) {
                    cache.target.options = cache.options
                }
                caches = []
            }
        }
    }
}

module.exports = Main
