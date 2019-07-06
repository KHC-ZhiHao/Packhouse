/**
 * @class ModuleBase
 * @desc 系統殼層
 */

class Case {}
class ModuleBase {

    constructor(name){
        this.$moduleBase = { 
            name: name || 'no name'
        };
    }

    /**
     * @function $systemError(functionName,maessage,object)
     * @private
     * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
     */

    $systemError(functionName, message, object = '$_no_error'){
        if (object !== '$_no_error') {
            console.log('error data => ', object )
        }
        throw new Error(`(☉д⊙)!! PackHouse::${this.$moduleBase.name} => ${functionName} -> ${message}`)
    }

    /**
     * @function $noKey(functionName,maessage,object)
     * @private
     * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
     */

    $noKey(functionName, target, key) {
        if (target[key] == null) {
            return true
        } else {
            this.$systemError(functionName, `Name(${key}) already exists.`)
            return false
        } 
    }

    /**
     * @function $verify
     * @private
     * @desc 驗證格式是否正確
     */

    $verify(data, validates, assign = {}) {
        let newData = {}
        for (let key in validates) {
            let validate = validates[key]
            let required = validate[0]
            let type = validate[1]
            let defaultValue = validate[2]
            if (required && data[key] == null) {
                this.$systemError('verify', `Key(${key}) is required`)
            }
            if (type && data[key] != null && !type.includes(typeof data[key])) {
                this.$systemError('verify', `Type(${key}::${typeof data[key]}) error, need ${type.join(' or ')}`)
            }
            newData[key] = data[key] || defaultValue
        }
        return Object.assign(newData, assign)
    }

    /**
     * @function $protection
     * @private
     * @desc 保護物件不被修改
     */

    $protection(data) {
        return new Proxy(data, {
            set: (target, key) => this.$systemError('$protection', `Key(${key}) is protection`, target)
        })
    }

}
