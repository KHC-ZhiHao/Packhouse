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
     * @noKey $systemError(functionName,maessage,object)
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

    $verify(data, validate, assign = {}) {
        let newData = {}
        for (let key in validate) {
            let v = validate[key]
            if (v[0] && data[key] == null) {
                this.$systemError('verify', 'Must required', key)
                return
            }
            if (data[key] != null) {
                if (typeof v[1] === (typeof data[key] === 'string' && data[key][0] === "#") ? data[key].slice(1) : 'string') {
                    newData[key] = data[key]
                } else {
                    this.$systemError('verify', `Type(${typeof v[1]}) error`, key)
                }
            } else {
                newData[key] = v[1]
            }
        }
        return Object.assign(newData, assign)
    }

}
