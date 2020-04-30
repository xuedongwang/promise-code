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
    self.status = MyPromise.PENDING;
    self.onFulfilled = [];
    self.onRejected = [];
    function resolve(value) {
      if (self.status === MyPromise.PENDING) {
        self.status = MyPromise.FULFILLED;
        self.value = value;
        self.onFulfilled.forEach((fn) => fn());
      }
    }
    function reject(reason) {
      if (self.status === MyPromise.PENDING) {
        self.status = MyPromise.REJECTED;
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
      if (this.status === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      } else if (this.status === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      } else if (this.status === MyPromise.PENDING) {
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
}

MyPromise.PENDING = 'pending';
MyPromise.FULFILLED = 'fulfilled';
MyPromise.REJECTED = 'rejected';


module.exports = MyPromise;
