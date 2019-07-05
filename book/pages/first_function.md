# 第一支工具 - First Tool

Tool是PK的函數最小單位，如果沒有額外的設計，基本上就是呼叫一個function。

## 第一支function

這是我們一個普通到不行的加總function

```js
function sum(a, b) {
    return a + b
}
```

## TypeScript

TypeScript的函數設計提供了我們良好的設計模式，可以指定

```ts
function sum(a: number, b:number): number {
    return a + b
}
```

