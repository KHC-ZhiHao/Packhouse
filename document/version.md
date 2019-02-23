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