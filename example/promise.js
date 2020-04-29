class MyPromise {
  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.onFulfilled = [];
    this.onRejected = [];
    this.value = undefined;
    this.reason = undefined;
    const self = this;

    function resolve (value) {
      if (self.status === MyPromise.PENDING) {
        self.status = Promise.FULFILLED;
        self.value = value;
        self.onFulfilled.forEach(fn => fn());
      }
    }
    function reject (reason) {
      if (self.status === MyPromise.PENDING) {
        self.status = Promise.REJECTED;
        self.reason = reason;
        self.onRejected.forEach(fn => fn());
      }
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }

  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
    const self = this;
    const promise2 = new MyPromise((resolve, reject) => {
      if (self.status === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(self.value);
            resolvePromise(primise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        })
      } else if (self.status === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(self.reason);
            resolvePromise(primise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        })
      } else if (self.status === MyPromise.PENDING) {
        self.onFulfilled.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(self.value);
              resolvePromise(primise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          })
        });
        self.onFulfilled.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(self.reason);
              resolvePromise(primise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          })
        });
      }
    });

    return promise2;
  };
}


function resolvePromise (promise2, x, resolve, reject) {
  if (promise2 === x) {
    reject(new TypeError('Chaining cycle'));
  }
  if (x && typeof x === 'object' || typeof x === 'function') {
    let used;
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (used) return;
          used = true;
          resolvePromise(promise2, y, resolve, reject)
        }, r => {
          if (used) return;
          used = true;
          reject(r);
        })
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

MyPromise.PENDING = 'pending';
MyPromise.FULFILLED = 'fulfilled';
MyPromise.REJECTED = 'rejected';


module.exports = MyPromise;