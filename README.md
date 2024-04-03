# Index-db-package

## 介绍

对浏览器数据库indexedDB进行了封装

## 安装教程

```js
npm install index-db-package
```

## 使用说明

```js
import IndexDB from 'index-db-package'
const database = new IndexDB('database')
const data = [
  { name: "Sales", max: 6500 },
  { name: "Administration", max: 16000 },
  { name: "Information Technology", max: 30000 },
  { name: "Customer Support", max: 38000 },
  { name: "Development", max: 52000 },
  { name: "Marketing", max: 25000 },
];
const indexArr = [{ key: "max", unique: false }];
const createArr = [
  {
    storeName: "customers",
    createType: "manual",
    DBType: "readwrite",
    primaryKey: "name",
    indexArr: indexArr,
  },
  {
    storeName: "customers2",
    createType: "automatic",
  },
];
database.open().then(()=>{
  database.createSheet(createArr).then(()=>{
    database.set("customers", data).then(() => {})
  })
})
```

## 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


## 使用文档

