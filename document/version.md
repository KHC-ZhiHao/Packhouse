# Version Log

## 1.0.5

### NEW

* NG : 新的錯誤乘載模式

## 1.0.6

### FIX

* Param Length: 修復動態配置參數如果有預設值導致錯誤，Assembly會偵測是否有預設值去parse參數

### NEW

* Un Packing: 移除宣告的包裝
* Param Length: 因應ES6語法可以手動置入參數長度來提升效能

### MODIFY

* Packing : 連續宣告將反覆包裝下去

## 1.0.7

### NEW

* Param Length: 直觀的錯誤處理

## 1.0.8

### NEW

* Group Alias: 群組別名，可以顯示在追蹤上
* Assembly Bridge: 在呼叫群組前宣告的函數
* Merger And Coop: Alone群組的內部運用

### MODIFY

* Error: 某些錯誤有了專屬的錯誤訊息
* Error : exception的追蹤能看到函數名稱

## 1.0.9

### INFO

Alone的出現嚴重破壞了Assembly的單純性，Group的關聯變的耦合，因此我重新審視了Alone的誕生，在某個專案中，我需要建構Repository來確保資料一致，我用了Assembly來建立Repository所需要的程式碼，再創造alone這個模式引入商業邏輯的Group中，這是糟糕的決定，再撰寫Test時我無法覆蓋Repository的程式碼，Test是Assembly的目標之一，如果能在aws lambda上進行TDD是多麼讓人開心的事，alone是必須存在的，Factory的存在只是賦予流程控制的接口，在1.0.8版本我試著賦予alone一個未來可以追蹤的接口(coop)，但仍無法彌補這個錯誤，本版本解開了Alone的限制，Group既可以Alone也可以寄付在Factory中(可以復用但create只會觸發一次，必須注意options進入的入口是否正確)

### NEW

* 開發者文件上線拉

### MODIFY

* 移除了Line上無意義的變數
* Merger: 1.0.8犯了個錯誤，Merger應該接收Group而不是Alone
* Alone: 新的策略，Alone將去除擴展限制

## 1.1.0

### NEW

* Mold : 參數配裝模式，目的在於清楚的知道物件參數間的定義

### FIX

* Group => addLine : 錯誤訊息修正

### MODIFY

* 移除babel與minify改用uglifyJS，這樣才能支援Symbol，但代表版本不再向下支援至es5