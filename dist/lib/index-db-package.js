!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self)["index-db-package"]=t()}(this,(function(){"use strict";const e=Symbol("create");return class{constructor(e){this.dbName=e,this.db=null,this.version=1,this.dataSheet=[],this.isOpen=!1}open(){return new Promise(((e,t)=>{const r=window.indexedDB.open(this.dbName);r.onsuccess=t=>{this.db=t.target.result;const r=this.db.objectStoreNames;0===r.length?(this.db&&this.db.close(),window.indexedDB.deleteDatabase(this.dbName),this.version=1,e(this.db),this.db=null):(this.version=this.db.version,this.dataSheet=Array.from(r),e(this.db)),this.isOpen=!0},r.onerror=()=>{t(Error("Why didn't you allow my web app to use IndexedDB?!"))}}))}close(){if(!this.isOpen)throw Error("The database is not open, this method cannot be used!");this.db&&this.db.close(),this.db=null}deleteDatabase(){if(!this.isOpen)throw Error("The database is not open, this method cannot be used!");this.db&&this.db.close(),this.db=null,window.indexedDB.deleteDatabase(this.dbName)}createDataSheet(t){if(!this.isOpen)throw Error("The database is not open, this method cannot be used!");if(this.db)for(let e=0;e<t.length;e+=1)if(!this.dataSheet.includes(t[e].storeName)){this.version+=1;break}return new Promise(((r,o)=>{this.db&&this.db.close();const n=window.indexedDB.open(this.dbName,this.version);this[e](n,t),n.onsuccess=e=>{this.db=e.target.result,r(this.db)},n.onerror=()=>{o(Error("Why didn't you allow my web app to use IndexedDB?!"))}}))}[e](e,t){e&&(e.onupgradeneeded=function(e){const r=e.target.result;t.forEach((e=>{const{storeName:t,createType:o,indexArr:n=[],DBType:s="",primaryKey:i=""}=e;if(!r.objectStoreNames.contains(t))if("automatic"===o)r.createObjectStore(t,{autoIncrement:!0});else{if("manual"!==o)throw Error(`Entered create type '${o}' is wrong value!`);{if(!s||!i)throw Error("Entered create type is manual, but Other required parameters are empty!");const e=r.createObjectStore(t,{keyPath:i});n&&n.length&&n.forEach((t=>{e.createIndex(t.key,t.key,{unique:t.unique})})),e.transaction.oncomplete=function(){r.transaction(t,s).objectStore(t)}}}}))})}set(e,t){if(!this.isOpen)throw Error("The database is not open, this method cannot be used!");const r=this.db.transaction([e],"readwrite"),o=r.objectStore(e);return t.forEach((function(e){o.put(e).onsuccess=function(){}})),new Promise(((e,t)=>{r.oncomplete=function(){e(r)},r.onerror=function(){t(Error("An error occurred during this operation, please check whether the parameters are correct!"))}}))}delete(e,t){if(!this.isOpen)throw Error("The database is not open, this method cannot be used!");const r=this.db.transaction([e],"readwrite");return r.objectStore(e).delete(t),new Promise(((e,t)=>{r.onsuccess=function(){e(r)},r.onerror=function(){t(Error("An error occurred during this operation, please check whether the parameters are correct!"))}}))}search(e,t,r,o=!1){if(!this.isOpen)throw Error("The database is not open, this method cannot be used!");r=r.toString().toLocaleLowerCase();const n=this.db.transaction([e]),s=n.objectStore(e),i=[];return new Promise(((a,c)=>{s.openCursor().onsuccess=function(n){const s=n.target.result;if(s){if(!s.value[t])throw Error(`There is no '${t}' index in the '${e}' data table, please check whether the value of the data is correct!`);const n=s.value[t]&&s.value[t].toString().toLocaleLowerCase();(o&&n.includes(r)||!o&&n===r)&&i.push(s.value),s.continue()}else a(i)},n.onerror=function(){c(Error("An error occurred during this operation, please check whether the parameters are correct!"))}}))}getOfKeyRange(e,t,r){if(!this.isOpen)throw Error("The database is not open, this method cannot be used!");const o=[],n=this.db.transaction([e]),s=n.objectStore(e);return new Promise(((e,i)=>{(r?s.openCursor(t,r):s.openCursor(t)).onsuccess=function(t){const r=t.target.result;r?(o.push(r.value),r.continue()):e(o)},n.onerror=function(){i(Error("An error occurred during this operation, please check whether the parameters are correct!"))}}))}updata(e,t,r,o){if(!this.isOpen)throw Error("The database is not open, this method cannot be used!");const n=this.db.transaction([e],"readwrite").objectStore(e),s=n.get(t);return new Promise(((e,t)=>{s.onerror=function(){t(Error("An error occurred during this operation, please check whether the parameters are correct!"))},s.onsuccess=function(i){const a=i.target.result;a[r]=o;const c=n.put(a);c.onerror=function(){t(Error("An error occurred during this operation, please check whether the parameters are correct!"))},c.onsuccess=function(){e(s.result)}}}))}clear(e){if(!this.isOpen)throw Error("The database is not open, this method cannot be used!");const t=this.db.transaction([e],"readwrite");return t.objectStore(e).clear(),new Promise(((e,r)=>{t.oncomplete=function(){e(t)},t.onerror=function(){r(Error("An error occurred during this operation, please check whether the parameters are correct!"))}}))}}}));