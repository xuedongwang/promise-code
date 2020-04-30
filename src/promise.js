const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    reject(new TypeError('Chaining cycle'));
  }
  if ((x && typeof x === 'object') || typeof x === 'function') {
    let used;
    try {
      const { then } = x;
      if (typeof then === 'function') {
        then.call(x, (y) => {
          if (used) return;
          used = true;
          resolvePromise(promise2, y, resolve, reject);
        }, (r) => {
          if (used) return;
          used = true;
          reject(r);
        });
      } else {
        if (used) return;
        used = true;
        resolve(x);
      }
    } catch (error) {
      if (used) return;
      used = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
}

class MyPromise {
  constructor(executor) {
    const self = this;
    self.status = PENDING;
    self.onFulfilled = [];
    self.onRejected = [];
    function resolve(value) {
      if (self.status === PENDING) {
        self.status = FULFILLED;
        self.value = value;
        self.onFulfilled.forEach((fn) => fn());
      }
    }
    function reject(reason) {
      if (self.status === PENDING) {
        self.status = REJECTED;
        self.reason = reason;
        self.onRejected.forEach((fn) => fn());
      }
    }
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilledFn, onRejectedFn) {
    const onFulfilled = typeof onFulfilledFn === 'function' ? onFulfilledFn : (value) => value;
    const onRejected = typeof onRejectedFn === 'function' ? onRejectedFn : (reason) => { throw reason; };
    const promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      } else if (this.status === PENDING) {
        this.onFulfilled.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        this.onRejected.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });
    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      (value) => MyPromise.resolve(callback()).then(() => value),
      (error) => MyPromise.resolve(callback()).then(() => { throw error; }),
    );
  }
}

MyPromise.resolve = (params) => {
  if (params instanceof MyPromise) {
    return params;
  }
  return new MyPromise((resolve, reject) => {
    if (params && params.then && typeof params === 'function') {
      setTimeout(() => {
        params.then(resolve, reject);
      });
    } else {
      resolve(params);
    }
  });
};

MyPromise.reject = (reason) => new MyPromise((resolve, reject) => {
  reject(reason);
});

MyPromise.all = (promises) => new MyPromise((resolve, reject) => {
  const index = 0;
  const result = [];
  function processValue(i, data) {
    result[i] = data;
    if (index === promises.length - 1) {
      resolve(result);
    }
  }
  if (promises.length === 0) {
    resolve(result);
  } else {
    promises.forEach((promise, i) => {
      MyPromise.resolve(promise).then((data) => {
        processValue(i, data);
      }, (error) => {
        reject(error);
      });
    });
  }
});

MyPromise.race = (promises) => new MyPromise((resolve, reject) => {
  promises.forEach((promise) => {
    MyPromise.resolve(promise).then((data) => {
      resolve(data);
    }, (err) => {
      reject(err);
    });
  });
});


module.exports = MyPromise;
