class Utils {
    /**
     * 獲取型別
     * @static
     * @param {*} target 任何型態都行
     * @returns {string} example之外的型態則回傳typeof的值
     * @example
     *  getType([]) // array
     *  getType(null) // empty
     *  getType(undefined) // empty
     *  getType(NaN) // NaN
     *  getType(/test/) // regexp
     *  getType(new Promise(() => {})) // promise
     *  getType(Buffer.from('123')) // buffer
     */

    static getType(target) {
        let type = typeof target
        if (Array.isArray(target)) {
            return 'array'
        }
        if (target == null) {
            return 'empty'
        }
        if (type === 'number' && isNaN(target)) {
            return 'NaN'
        }
        if (target instanceof RegExp) {
            return 'regexp'
        }
        if (target && typeof target.then === 'function') {
            return 'promise'
        }
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(target)) {
            return 'buffer'
        }
        return type
    }

    /**
     * 驗證和回傳預設與付值結果
     * @static
     * @param {object} data 標的物
     * @param {object.<array>} validates 驗證模型[required:boolean, types:array, default:*]
     * @returns {object}
     * @example
     *  let options = verify({ a: 5 }, {
     *      a: [true, ['number'], 0],
     *      b: [false, ['number'], 'test']
     *  })
     *  console.log(options.b) // test
     */

    static verify(data = {}, validates) {
        let newData = {}
        for (let key in validates) {
            let target = data[key]
            let type = Utils.getType(target)
            let [required, types, defaultValue] = validates[key]
            if (Utils.getType(required) !== 'boolean') {
                throw new Error('Required must be a boolean')
            }
            if (Utils.getType(types) !== 'array') {
                throw new Error('Types must be a array')
            }
            if (required && target == null) {
                throw new Error(`Key(${key}) is required`)
            }
            if (types && target != null && !types.includes(type)) {
                throw new Error(`Type(${key}::${type}) error, need ${types.join(' or ')}`)
            }
            newData[key] = target === undefined ? defaultValue : target
        }
        return newData
    }

    /**
     * 模擬uuid的建構方法，但不是真的uuid，不保證不會重複，但很難重複
     * @static
     * @returns {string}
     */

    static generateId() {
        var now = Date.now()
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            now += performance.now()
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (now + Math.random() * 16) % 16 | 0
            now = Math.floor(now / 16)
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })
    }

    /**
     * 主要是這比slice快很多
     * @param {array} target
     */

    static arrayCopy(target) {
        var i = target.length
        var output = []
        while (i--) {
            output[i] = target[i]
        }
        return output
    }
}

module.exports = Utils
