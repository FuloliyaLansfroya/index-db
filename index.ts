const create = Symbol('create');
type createInter = {
  storeName: string; // 数据表名称
  createType: string; // 创建方式 manual 手动 automatic 自动
  DBType?: string; // 数据表类型 只支持readonly、readwrite 和 versionchange三种
  primaryKey?: string; // 主键
  indexArr?: Array<{ key: string; unique: boolean }>; // indexArr 索引
};
class IndexDB {
  dbName: any;
  db: any | null;
  version: any;
  dataSheet!: string[];
  isOpen: boolean;
  /**
   *
   * @param {string} name 数据库名称
   */
  constructor (name: string) {
    this.dbName = name; // 数据库名称
    this.db = null; // 数据库实例
    this.version = 1; // 版本号
    this.dataSheet = []; // 数据表列表
    this.isOpen = false; // 是否开启了数据库
  }

  /**
   * 打开数据库
   * @returns Promise
   */
  open () {
    return new Promise((resolve, reject) => {
      const database = window.indexedDB.open(this.dbName);
      database.onsuccess = (event: any) => {
        this.db = event.target.result;
        const objectStoreNames = this.db.objectStoreNames;
        // 若是一开始不存在该数据库，清除刚才打开的数据库并删除，记录结果，否则更新版本号
        if (objectStoreNames.length === 0) {
          this.db && this.db.close();
          window.indexedDB.deleteDatabase(this.dbName);
          this.version = 1;
          resolve(this.db);
          this.db = null;
        } else {
          this.version = this.db.version;
          this.dataSheet = Array.from(objectStoreNames);
          resolve(this.db);
        }
        this.isOpen = true;
      };
      database.onerror = () => {
        reject(Error("Why didn't you allow my web app to use IndexedDB?!"));
      };
    });
  }

  /**
   * @function 关闭数据库
   */
  close () {
    if (!this.isOpen) {
      throw Error('The database is not open, this method cannot be used!');
    }
    this.db && this.db.close();
    this.db = null;
  }

  /**
   * @function 删除数据库
   */
  deleteDatabase () {
    if (!this.isOpen) {
      throw Error('The database is not open, this method cannot be used!');
    }
    this.db && this.db.close();
    this.db = null;
    window.indexedDB.deleteDatabase(this.dbName);
  }

  /**
   * @function 新建数据表
   * @param {Array<createInter>} createArr 新建数据表数组
   * @returns Promise
   */
  createDataSheet (createArr: Array<createInter>) {
    if (!this.isOpen) {
      throw Error('The database is not open, this method cannot be used!');
    }
    if (this.db) {
      for (let i = 0; i < createArr.length; i += 1) {
        if (!this.dataSheet.includes(createArr[i].storeName)) {
          this.version += 1;
          break;
        }
      }
    }
    return new Promise((resolve, reject) => {
      this.db && this.db.close();
      const database = window.indexedDB.open(this.dbName, this.version);
      this[create](database, createArr);
      database.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      database.onerror = () => {
        reject(Error("Why didn't you allow my web app to use IndexedDB?!"));
      };
    });
  }

  /**
   * @function 创建数据表
   * @param {IDBOpenDBRequest} database 数据库
   * @param {createInter[]} createArr 新建数据表数组
   * 私有函数
   */
  [create] (database: IDBOpenDBRequest, createArr: createInter[]) {
    if (database) {
      database.onupgradeneeded = function (event: any) {
        const db = event.target.result;
        createArr.forEach((val) => {
          const { storeName, createType, indexArr = [], DBType = '', primaryKey = '' } = val;
          if (!db.objectStoreNames.contains(storeName)) {
            /**
             * automatic 自动化
             * manual 手动化
             */
            if (createType === 'automatic') {
              db.createObjectStore(storeName, { autoIncrement: true });
            } else if (createType === 'manual') {
              if (!DBType || !primaryKey) {
                throw Error('Entered create type is manual, but Other required parameters are empty!');
              }
              const objectStore = db.createObjectStore(storeName, { keyPath: primaryKey });
              indexArr &&
                indexArr.length &&
                indexArr.forEach((index: { key: string; unique: boolean }) => {
                  objectStore.createIndex(index.key, index.key, { unique: index.unique });
                });
              objectStore.transaction.oncomplete = function () {
                db.transaction(storeName, DBType).objectStore(storeName);
              };
            } else {
              throw Error(`Entered create type '${createType}' is wrong value!`);
            }
          }
        });
      };
    }
  }

  /**
   * @function 插入数据
   * @param {string} storeName 数据表名称
   * @param {object[]} data 插入数据
   * @returns Promise
   */
  set (storeName: string, data: object[]) {
    if (!this.isOpen) {
      throw Error('The database is not open, this method cannot be used!');
    }
    const transaction = this.db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    data.forEach(function (customer: any) {
      const request = objectStore.put(customer);
      request.onsuccess = function () {
        // event.target.result === customer.ssn;
      };
    });
    return new Promise((resolve, reject) => {
      transaction.oncomplete = function () {
        resolve(transaction);
      };

      transaction.onerror = function () {
        // 不要忘记错误处理！
        reject(Error('An error occurred during this operation, please check whether the parameters are correct!'));
      };
    });
  }

  /**
   * @function 删除数据
   * @param {string} storeName 数据表名称
   * @param {string} key 键值
   * @returns Promise
   */
  delete (storeName: string, key: string) {
    if (!this.isOpen) {
      throw Error('The database is not open, this method cannot be used!');
    }
    const transaction = this.db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    objectStore.delete(key);
    return new Promise((resolve, reject) => {
      transaction.onsuccess = function () {
        resolve(transaction);
      };
      transaction.onerror = function () {
        // 不要忘记错误处理！
        reject(Error('An error occurred during this operation, please check whether the parameters are correct!'));
      };
    });
  }

  /**
   * @function 获得某条数据(模糊搜索)
   * @param {string} storeName 数据表名称
   * @param {stirng} index 键值
   * @param {any} search 查询的值
   * @param {boolean} isVague 是否开启模糊搜索
   * @returns Promise
   */
  search (storeName: string, index: string, search: any, isVague = false) {
    if (!this.isOpen) {
      throw Error('The database is not open, this method cannot be used!');
    }
    search = search.toString().toLocaleLowerCase();
    const transaction = this.db.transaction([storeName]);
    const objectStore = transaction.objectStore(storeName);
    const customers: any = [];
    return new Promise((resolve, reject) => {
      objectStore.openCursor().onsuccess = function (event: { target: { result: any } }) {
        const cursor = event.target.result;
        if (cursor) {
          if (!cursor.value[index]) {
            throw Error(`There is no '${index}' index in the '${storeName}' data table, please check whether the value of the data is correct!`);
          }
          const targetSearch = cursor.value[index] && cursor.value[index].toString().toLocaleLowerCase();
          if ((isVague && targetSearch.includes(search)) || (!isVague && targetSearch === search)) {
            customers.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(customers);
        }
      };
      transaction.onerror = function () {
        // 不要忘记错误处理！
        reject(Error('An error occurred during this operation, please check whether the parameters are correct!'));
      };
    });
  }
  //  "prev"

  //  "prev"
  /**
   * @function 获得条件下的数据，默认为全部数据
   * @param {string} storeName 数据表名称
   * @param {IDBKeyRange | null} KeyRange
   * 1.IDBKeyRange.only(key) 仅匹配 key。
   *
   * 2.IDBKeyRange.lowerBound(key, boolean) 匹配所有超过key的，true: 包括key, false: 不包括key。
   *
   * 3.IDBKeyRange.upperBound(key, boolean) 匹配所有不超过key的，true: 包括key, false: 不包括key。
   *
   * 4.IDBKeyRange.bound(key1, key2, boolean1, boolean2) 匹配所有在key1和key2之间的，true: 包括key, false: 不包括key。
   * @param {string | null} desc 排序，prev:倒叙,null:正序
   * @returns Promise
   */
  getOfKeyRange (storeName: string, KeyRange?: IDBKeyRange | null, desc?: string | null) {
    if (!this.isOpen) {
      throw Error('The database is not open, this method cannot be used!');
    }
    const customers: any = [];
    const transaction = this.db.transaction([storeName]);
    const objectStore = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const openCursor = desc ? objectStore.openCursor(KeyRange, desc) : objectStore.openCursor(KeyRange);
      openCursor.onsuccess = function (event: { target: { result: any } }) {
        const cursor = event.target.result;
        if (cursor) {
          customers.push(cursor.value);
          cursor.continue();
        } else {
          resolve(customers);
        }
      };
      transaction.onerror = function () {
        // 不要忘记错误处理！
        reject(Error('An error occurred during this operation, please check whether the parameters are correct!'));
      };
    });
  }

  /**
   * @function 升级数据
   * @param {string} storeName 数据表名称
   * @param {string} key 键值
   * @param {string} index 索引
   * @param {any} newVal 更新的值
   * @returns Promise
   */
  updata (storeName: string, key: string, index: string, newVal: any) {
    if (!this.isOpen) {
      throw Error('The database is not open, this method cannot be used!');
    }
    const transaction = this.db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(key);
    return new Promise((resolve, reject) => {
      request.onerror = function () {
        // 错误处理
        reject(Error('An error occurred during this operation, please check whether the parameters are correct!'));
      };
      request.onsuccess = function (event: { target: { result: any } }) {
        // 获取我们想要更新的数据
        const data = event.target.result;
        // 更新你想修改的数据
        data[index] = newVal;
        // 把更新过的对象放回数据库
        const requestUpdate = objectStore.put(data);
        requestUpdate.onerror = function () {
          // 错误处理
          reject(Error('An error occurred during this operation, please check whether the parameters are correct!'));
        };
        requestUpdate.onsuccess = function () {
          // 完成，数据已更新！
          resolve(request.result);
        };
      };
    });
  }

  clear (storeName: string) {
    if (!this.isOpen) {
      throw Error('The database is not open, this method cannot be used!');
    }
    const transaction = this.db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    objectStore.clear();
    return new Promise((resolve, reject) => {
      transaction.oncomplete = function () {
        resolve(transaction);
      };
      transaction.onerror = function () {
        // 不要忘记错误处理！
        reject(Error('An error occurred during this operation, please check whether the parameters are correct!'));
      };
    });
  }
}
export default IndexDB;

//   createDataSheet(storeName: string, createType: string, data: object[], DBType: string = "", primaryKey: string = "", indexArr: Array<{ key: string; unique: boolean }> = []) {
//     const this = this;
//     if (this.db && !this.dataSheet.includes(storeName)) {
//       this.version++;
//     }
//     return new Promise((resolve, reject) => {
//       this.db && this.db.close();
//       if (createType === "manual" && (!DBType || !primaryKey || !indexArr || !indexArr.length)) {
//         throw Error("Entered create type is manual, but Other required parameters are empty!");
//       }
//       const database = window.indexedDB.open(this.dbName, this.version);
//       if (createType === "automatic") {
//         this[automaticCreate](database, storeName, data);
//       } else if (createType === "manual") {
//         this[manualCreate](database, storeName, DBType, primaryKey, indexArr, data);
//       } else {
//         throw Error(`Entered create type ${createType} is wrong value!`);
//       }
//       database.onsuccess = (event: any) => {
//         this.db = event.target.result;
//         resolve(this.db);
//       };
//       database.onerror = (event: any) => {
//         reject("Why didn't you allow my web app to use IndexedDB?!");
//       };
//     });
//     }

//   /**
//    * 手动新建数据表
//    * @param {IDBOpenDBRequest} database 数据库
//    * @param {string} storeName 数据表名称
//    * @param {string} DBType 数据表类型 只支持readonly、readwrite 和 versionchange三种
//    * @param {string} primaryKey 主键
//    * @param {Array<{key:string, unique:boolean}>} indexArr 索引
//    * @param {object[]} data 数据
//    * 私有函数
//    */
//    [manualCreate](database: IDBOpenDBRequest, storeName: string, DBType: string, primaryKey: string, indexArr: Array<{ key: string; unique: boolean }>, data: object[]) {
//     const this = this;
//     if (database) {
//       database.onupgradeneeded = function (event: any) {
//         const db = event.target.result;
//         if (!db.objectStoreNames.contains(storeName)) {
//           const objectStore = db.createObjectStore(storeName, { keyPath: primaryKey });
//           indexArr.forEach((index: { key: string; unique: boolean }) => {
//             objectStore.createIndex(index.key, index.key, { unique: index.unique });
//           });
//           objectStore.transaction.oncomplete = function (event: any) {
//             const customerObjectStore = db.transaction(storeName, DBType).objectStore(storeName);
//             data.forEach(function (customer: any) {
//               customerObjectStore.add(customer);
//             });
//           };
//         }
//       };
//     }
//   }
//   /**
//    * 自动新建数据表
//    * @param {IDBOpenDBRequest} database 数据库
//    * @param {string} storeName 数据表名称
//    * @param {object[]} data 数据
//    * 私有函数
//    */
//   [automaticCreate](database: IDBOpenDBRequest, storeName: string, data: object[]) {
//     const this = this;
//     if (database) {
//       database.onupgradeneeded = function (event: any) {
//         const db = event.target.result;
//         if (!db.objectStoreNames.contains(storeName)) {
//           const objectStore = db.createObjectStore(storeName, { autoIncrement: true });
//           data.forEach(function (customer: any) {
//             objectStore.add(customer);
//           });
//         }
//       };
//     }
//   }
