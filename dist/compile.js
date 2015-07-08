/**
 * Created by hanjinchi on 15/6/29.
 */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

var Promise = (function () {
  function Promise() {
    _classCallCheck(this, Promise);

    this.state = 'pending';
    this.thenables = [];
  }

  _createClass(Promise, [{
    key: 'resolve',
    value: function resolve(value) {
      if (this.state != 'pending') {
        return;
      }

      this.state = 'fulfilled';
      this.value = value;
      this._handleThen();
      return this;
    }
  }, {
    key: 'reject',
    value: function reject(reason) {
      if (this.state != 'pending') {
        return;
      }

      this.state = 'rejected';
      this.reason = reason;
      this._handleThen();
      return this;
    }
  }, {
    key: 'then',
    value: function then(onFulfilled, onRejected) {
      var thenable = {};
      if (typeof onFulfilled === 'function') {
        thenable.fulfill = onFulfilled;
      }

      if (typeof onRejected === 'function') {
        thenable.reject = onRejected;
      }

      if (this.state != 'pending') {
        setImmediate((function () {
          this._handleThen();
        }).bind(this));
      }

      thenable.promise = new Promise();
      this.thenables.push(thenable);

      return thenable.promise;
    }
  }, {
    key: '_handleThen',
    value: function _handleThen() {
      if (this.state === 'pending') return;

      if (this.thenables.length) {
        for (var i = 0; i < this.thenables.length; i++) {
          var thenPromise = this.thenables[i].promise;
          var returnedVal = undefined;
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
          } catch (e) {
            thenPromise.reject(e);
          }
        }
        this.thenables = [];
      }
    }
  }]);

  return Promise;
})();