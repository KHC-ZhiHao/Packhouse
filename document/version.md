# Version Log

## 1.0.0

轉移Assembly至Packhouse

## 1.0.1

### INFO

Mold的耦合比想像中小，也比想像中還複用，簡單的東西果然最實在。

### NEW

* public mold: 可以全域宣告mold
* system => casting: 可以藉由system呼叫casting

### FIX

* create => coop : create的system邏輯居然是獨立的...現在和action一樣了

### MODIFY

* error: 修正錯誤訊息還是Assembly的錯誤

## 1.0.2

### NEW

* async loop: 支援非同步迴圈

### MODIFY

* error: 更良好的錯誤顯示。

## 1.0.3

### INFO

Order可以算是Packhouse的終極應用了，一個可以複數緩衝與快取的組件，將大幅降低運算成本與請求次數，這對cloud function將有非常大的幫助。

現階段的Tool太過強大了，幾乎包辦了九成的應用，Line相對的消耗效能與實用性低，接下來可能會注重在強化Line的擴展上，畢竟柯理化函數有更大的發展空間。

### NEW

* tool => update : 當指定時間到達後，再次呼叫該tool會執行一次update
* tool => updateTime : 指定的時間(ms)
* tool => addTools : tool可能會太過龐大，tools可以勉強協助分裝
* tool => addMolds : mold可能會太過龐大，molds可以勉強協助分裝
* order : 全新的模式，一個以key為主的快取與緩衝組件

## 1.0.4

### NEW

* tool => update : 執行本身的更新
* tool => updateCall : 執行指定的更新

### MODIFY

* tool: 進行微重構。

## 1.0.5

### FIX

* tool => update : 如果tool還沒宣告create，呼叫update會報錯的bug

## 1.0.6

### NEW

* Factory和Group都有export的接口，降低開發衝突
* sop and unsop : 當執行結束時執行的function
* order => list : 獲取快取地圖

### MODIFY

* line: 新的Private Key => setRule。

## 1.0.7

### NEW

* Order、Factory都能接收options
* Order => max : 能夠承受快取的最大值，若超過則先移除第一筆快取，預設為1000

### MODIFY

* exports: 新的export模式
* 系統優化，系統運行比1.0.6快4倍左右，但還是很慢...

## 1.0.8

### INFO

邏輯被狗啃了T_T

### FIX

* system_error: 系統錯誤的this被指引錯誤，錯誤的錯誤
* packing: 參數計算的錯誤

## 1.0.9

### INFO

稍微拯救了孤兒Line，共享tool的紅利。

做了一點比較長遠的規劃，基本上是定型的一個版本，下一步應該會是完整的說明文件。

## NEW

* Line => input to tool: 可以使用tool的模式宣告input
* Line => layout to tool: 可以使用tool的模式宣告layout
* Line => setRule: 可以宣告rule獲取和tool一樣的效果
* Tool => promise => ng : 可以接受第二個參數 { resolve: true } 來使錯誤回報resolve
* Tool => tool: include的簡寫
* Tool => line: 可以引入line了
* Tool => weld: 將結果引入外部tool並共享ng
* Tool => rule : 一同宣告ng和sop
* Tool => clear: 清空所有狀態
* Mold => extras : 能用\|分割參數
* Mold => 取得index與call name
* Group => secure : 保護數值不被更動

### MODIFY

* copy support機制 : 現在重複用tool更安全了
* Public mold : 不可被取代。
* order : onReady重複宣告時不會做動也不會報錯

## 1.1.0

### NEW

* Group => Module mold : 針對引用混亂的狀態做的修補行為
* Group => Get Profile : 獲取Group的詳細資料，該版本仍為實驗功能

## 1.1.1

### FIX

* 修正文本錯誤

## 1.1.2

### FIX

* Public mold : 修復System未被引入的錯誤