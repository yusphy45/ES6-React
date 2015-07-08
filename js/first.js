/**
 * Created by hanjinchi on 15/6/29.
 */
let items = [1, 2, 3, 4, 5, 6];
let results = [];
let running = 0;
let limit = 2;

let async = (arg, callback) => {
  console.log('参数为 ' + arg + ' ,1秒后返回结果');
  setTimeout(function () {
    callback(arg * 2);
  }, 1000);
};

let final = (value) => {
  console.log('完成: ', value);
};

let launcher = () => {
  while (running < limit && items.length > 0) {
    let item = items.shift();
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

class Promise {

  constructor() {
    this.state = 'pending';
    this.thenables = [];
  }

  resolve(value) {
    if (this.state != 'pending') {
      return;
    }

    this.state = 'fulfilled';
    this.value = value;
    this._handleThen();
    return this;
  }

  reject(reason) {
    if (this.state != 'pending') {
      return;
    }

    this.state = 'rejected';
    this.reason = reason;
    this._handleThen();
    return this;
  }

  then(onFulfilled, onRejected) {
    let thenable = {};
    if (typeof onFulfilled === 'function') {
      thenable.fulfill = onFulfilled;
    }

    if (typeof onRejected === 'function') {
      thenable.reject = onRejected;
    }

    if (this.state != 'pending') {
      setImmediate(function () {
        this._handleThen();
      }.bind(this));
    }

    thenable.promise = new Promise();
    this.thenables.push(thenable);

    return thenable.promise;
  }

  _handleThen() {
    if (this.state === 'pending') return;

    if (this.thenables.length) {
      for (let i = 0; i < this.thenables.length; i++) {
        let thenPromise = this.thenables[i].promise;
        let returnedVal;
        try {

          switch (this.state) {
            case 'fulfilled':
              if (this.thenables[i].fulfill) {
                returnedVal = this.thenables[i].fulfill(this.value);
              } else {
                thenPromise.resolve(this.value);
              }
              break;
            case 'rejected':
              if (this.thenables[i].reject) {
                returnedVal = this.thenables[i].reject(this.reason);
              } else {
                thenPromise.reject(this.reason);
              }
              break;
            default:
              break;
          }

          if (returnedVal === null) {
            this.thenables[i].promise.resolve(returnedVal);
          } else if (returnedVal instanceof Promise || typeof returnedVal.then === 'function') {
            returnedVal.then(thenPromise.resolve.bind(thenPromise), thenPromise.reject.bind(thenPromise));
          } else {
            this.thenables[i].promise.resolve(returnedVal);
          }

        }
        catch
          (e) {
          thenPromise.reject(e);
        }
      }
      this.thenables = [];
    }
  }
}