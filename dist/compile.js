/**
 * Created by hanjinchi on 15/6/29.
 */
'use strict';

var items = [1, 2, 3, 4, 5, 6];
var results = [];
var running = 0;
var limit = 2;

var async = function async(arg, callback) {
  console.log('参数为 ' + arg + ' ,1秒后返回结果');
  setTimeout(function () {
    callback(arg * 2);
  }, 1000);
};

var final = function final(value) {
  console.log('完成: ', value);
};

var launcher = function launcher() {
  while (running < limit && items.length > 0) {
    var item = items.shift();
    async(item, function (result) {
      running--;
      results.push(result);
      if (items.length > 0) {
        launcher();
      } else if (running === 0) {
        final(results);
      }
    });
    running++;
  }
};

//class Promise {
//
//  constructor() {
//    this.state = 'pending';
//    this.thenables = [];
//  }
//
//  resolve(value) {
//    if (this.state != 'pending') {
//      return;
//    }
//
//    this.state = 'fulfilled';
//    this.value = value;
//    this._handleThen();
//    return this;
//  }
//
//
//  reject(reason) {
//    if (this.state != 'pending') {
//      return;
//    }
//
//    this.state = 'rejected';
//    this.reason = reason;
//    this._handleThen();
//    return this;
//  }
//
//  _handleThen() {
//    if (this.state === 'pending') return;
//
//    if (this.thenables.length) {
//      for (let i = 0; i < this.thenables.length; i++) {
//        let thenPromise = this.thenables[i].promise;
//        let returnedVal;
//        try {
//
//          switch (this.state) {
//            case 'fulfilled':
//              if (this.thenables[i].fulfill) {
//                returnedVal = this.thenables[i].fulfill(this.value);
//              } else {
//                thenPromise.resolve(this.value);
//              }
//              break;
//            case 'rejected':
//              if (this.thenables[i].reject) {
//                returnedVal = this.thenables[i].reject(this.reason);
//              } else {
//                thenPromise.reject(this.reason);
//              }
//              break;
//          }
//
//          if (returnedVal === null) {
//            this.thenables[i].promise.resolve(returnedVal);
//          } else {
//            if (returnedVal instanceof Promise || typeof returnedVal.then === 'function') {
//              returnedVal.then(thenPromise.resolve.bind(thenPromise), thenPromise.reject.bind(thenPromise));
//            } else {
//              this.thenables[i].promise.resolve(returnedVal);
//            }
//          }
//
//        }
//        catch (e) {
//          thenPromise.reject(e);
//        }
//      }
//      this.thenables = [];
//    }
//  }
//
//  then(onFulfilled, onRejected) {
//    var thenable = {};
//
//    if (typeof onFulfilled === 'function') {
//      thenable.fulfill = onFulfilled;
//    }
//
//    if (typeof onRejected === 'function') {
//      thenable.reject = onRejected;
//    }
//
//    thenable.promise = new Promise();
//    this.thenables.push(thenable);
//
//    if (this.state != 'pending') {
//      (this._handleThen());
//    }
//
//    return this;
//  }
//}
//
//
//var test = (arr = [1,2,3,4,5,6]) => {
//  setTimeout(function () {
//    var arg = arr.shift();
//    console.log('参数为 ' + arg + ' ,1秒后返回结果');
//    return arr;
//  }, 1000);
//
//};
//
//var p = (arr = items) => {
//  var q = new Promise();
//  if (arr instanceof Array) {
//    q.resolve(arr);
//  } else {
//    q.reject(arr);
//  }
//  return q;
//};
//
//p().then((arr)=> {
//  let result = test(arr);
//  return result;
//}).then((arr)=> {
//  let result = test(arr);
//  return result;
//}).then((arr)=> {
//  let result = test(arr);
//  return result;
//}).then((arr)=> {
//  let result = test(arr);
//  return result;
//}).then((arr)=> {
//  let result = test(arr);
//  return result;
//}).then((arr)=> {
//  let result = test(arr);
//  return result;
//},(reson)=>{
//  console.log(reson);
//});

var PENDING = undefined,
    FULFILLED = 1,
    REJECTED = 2;

var isFunction = function isFunction(obj) {
  return 'function' === typeof obj;
};
var isArray = function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};
var isThenable = function isThenable(obj) {
  return obj && typeof obj['then'] == 'function';
};

var transition = function transition(status, value) {
  var promise = this;
  if (promise._status !== PENDING) return;
  // 所以的执行都是异步调用，保证then是先执行的
  setTimeout(function () {
    promise._status = status;
    publish.call(promise, value);
  });
};
var publish = function publish(val) {
  var promise = this,
      fn,
      st = promise._status === FULFILLED,
      queue = promise[st ? '_resolves' : '_rejects'];

  while (fn = queue.shift()) {
    val = fn.call(promise, val) || val;
  }
  promise[st ? '_value' : '_reason'] = val;
  promise['_resolves'] = promise['_rejects'] = undefined;
};

var Promise = function Promise(resolver) {
  if (!isFunction(resolver)) throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  if (!(this instanceof Promise)) return new Promise(resolver);

  var promise = this;
  promise._value;
  promise._reason;
  promise._status = PENDING;
  promise._resolves = [];
  promise._rejects = [];

  var resolve = function resolve(value) {
    transition.apply(promise, [FULFILLED].concat([value]));
  };
  var reject = function reject(reason) {
    transition.apply(promise, [REJECTED].concat([reason]));
  };

  resolver(resolve, reject);
};

Promise.prototype.then = function (onFulfilled, onRejected) {
  var promise = this;
  // 每次返回一个promise，保证是可thenable的
  return Promise(function (resolve, reject) {
    function callback(value) {
      var ret = isFunction(onFulfilled) && onFulfilled(value) || value;
      if (isThenable(ret)) {
        ret.then(function (value) {
          resolve(value);
        }, function (reason) {
          reject(reason);
        });
      } else {
        resolve(ret);
      }
    }

    function errback(reason) {
      reason = isFunction(onRejected) && onRejected(reason) || reason;
      reject(reason);
    }

    if (promise._status === PENDING) {
      promise._resolves.push(callback);
      promise._rejects.push(errback);
    } else if (promise._status === FULFILLED) {
      // 状态改变后的then操作，立刻执行
      callback(promise._value);
    } else if (promise._status === REJECTED) {
      errback(promise._reason);
    }
  });
};

Promise.prototype['catch'] = function (onRejected) {
  return this.then(undefined, onRejected);
};

Promise.prototype.delay = function (ms) {
  return this.then(function (val) {
    return Promise.delay(ms, val);
  });
};

Promise.delay = function (ms, val) {
  return Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(val);
    }, ms);
  });
};

Promise.resolve = function (arg) {
  return Promise(function (resolve, reject) {
    resolve(arg);
  });
};

Promise.reject = function (arg) {
  return Promise(function (resolve, reject) {
    reject(arg);
  });
};

Promise.all = function (promises) {
  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to all.');
  }
  return Promise(function (resolve, reject) {
    var i = 0,
        result = [],
        len = promises.length;

    function resolver(index) {
      return function (value) {
        resolveAll(index, value);
      };
    }

    function rejecter(reason) {
      reject(reason);
    }

    function resolveAll(index, value) {
      result[index] = value;
      if (index == len - 1) {
        resolve(result);
      }
    }

    for (; i < len; i++) {
      promises[i].then(resolver(i), rejecter);
    }
  });
};

Promise.race = function (promises) {
  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to race.');
  }
  return Promise(function (resolve, reject) {
    var i = 0,
        len = promises.length;

    function resolver(value) {
      resolve(value);
    }

    function rejecter(reason) {
      reject(reason);
    }

    for (; i < len; i++) {
      promises[i].then(resolver, rejecter);
    }
  });
};

var getData100 = function getData100() {
  return Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve('200ms');
    }, 2000);
  });
};

var getData200 = function getData200() {
  return Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve('200ms');
    }, 2000);
  });
};

function doSomething() {
  console.log('doSomething(): start');
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log('doSomething(): end');
      var data = 'result of doSomething';
      resolve(data);
    }, 1000);
  });
}

function doSomethingElse(data) {
  console.log('doSomethingElse(): start');
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log('doSomethingElse(): end' + data);
      var result = 'result of doSomethingElse';
      resolve(result);
    }, 1000);
  });
}

function finalHandler(data) {
  console.log('finalHandler(): start');
  return new Promise(function (resolve) {
    setTimeout(function () {
      console.log('finalHandler(): end' + data);
      var result = 'result of finalHandler';
      resolve(result);
    }, 1000);
  });
}

doSomething().then(doSomethingElse).then(finalHandler);