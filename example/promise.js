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
        self.status = Promise.PENDING;
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
    console.log(1, typeof onFulfilled);
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };
    console.log(1-1, typeof onFulfilled);
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(primise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        })
      } else if (this.status === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(primise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        })
      } else if (this.status === MyPromise.PENDING) {
        this.onFulfilled.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(primise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          })
        });
        this.onFulfilled.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
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
      let then = promise2.then;
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