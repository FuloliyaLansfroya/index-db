# Index-db-package

## Description
The browser database indexedDB is encapsulated

## Installation

```js
npm install index-db-package
```

## Instructions

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

## Contribution

1.  Fork the repository
2.  Create Feat_xxx branch
3.  Commit your code
4.  Create Pull Requests

## documentation
