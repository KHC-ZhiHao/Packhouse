function deepClone(obj, hash = new WeakMap()) {
    if (Object(obj) !== obj) {
        return obj
    }
    if (obj instanceof Set) {
        return new Set(obj)
    }
    if (hash.has(obj)) {
        return hash.get(obj)
    }
    const result = obj instanceof Date ? new Date(obj) : obj instanceof RegExp ? new RegExp(obj.source, obj.flags) : Object.create(null)
    hash.set(obj, result)
    if (obj instanceof Map) {
        Array.from(obj, ([key, val]) => {
            result.set(key, deepClone(val, hash))
        })
    }
    return Object.assign(result, ...Object.keys(obj).map((key) => {
        return ({
            [key]: deepClone(obj[key], hash)
        })
    }))
}

class Main {
    constructor(packhouse) {
        const caches = []
        const getGroup = name => {
            return packhouse._core.getGroup(name)
        }
        const parseName = name => {
            let [group, tool] = name.split('/')
            return { group, tool }
        }
        packhouse.test = {
            mock: (type, name, callback) => {
                let result = parseName(name)
                let group = getGroup(result.group)
                let target = type === 'tool' ? group.getTool(result.tool) : group.getLine(result.tool)
                let options = target.options
                let clone = deepClone(options)
                console.log(clone)
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
                for (let cache of caches) {
                    if (cache.type === type && cache.name === name) {
                        cache.target.options = cache.options
                        break
                    }
                }
            },
            restoreAll: () => {
                for (let cache of caches) {
                    cache.target.options = cache.options
                }
            }
        }
    }
}

module.exports = Main
