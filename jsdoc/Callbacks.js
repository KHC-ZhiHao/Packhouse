/**
 * @callback NgCallback
 * @param {*} error 錯誤訊息
 */

/**
 * @callback SopCallback
 * @param {object} context 封裝的訊息
 * @param {boolean} context.success 是否成功
 * @param {*} context.result 該次呼叫的回傳值
 */

/**
 * @callback WeldCallback
 * @param {*} result 上一組呼叫的結果
 * @param {function} pack 該tool執行前的pack
 */

/**
 * @callback PumpEachCallback
 * @param {function} press 同pump press
 * @param {number} count 當下計次
 */

/**
 * @callback OrderError
 * @param {*} result 錯誤的結果
 */

/**
 * @callback OrderSuccess
 * @param {*} result 成功的結果
 */

/**
 * @callback OrderCallback
 * @param {function} error 失敗時的回呼函數
 * @param {function} success 成功時的回乎函數
 */

/**
 * @callback CastingCallback
 * @param {*} result 錯誤的結果
 */
