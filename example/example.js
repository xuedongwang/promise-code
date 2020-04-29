class MyPromise {
  constructor (executor) {
    this.status = 'pedding';
    this.value = undefined;
    this.reason = undefined;
    //存放成功回调的函数
    this.onResolvedCallbacks = []
    //存放失败回调的函数
    this.onRejectedCallbacks = []

    let resolve = data => {
      if (this.status === 'pedding') {
        this.status = 'resolve'
        this.value = data
        this.onResolvedCallbacks.forEach(fn=>fn())
      }
    }
    let reject = data => {
      if (this.status === 'pedding') {
        this.status = 'reject'
        this.reason = data
        //监听回调函数
        this.onRejectedCallbacks.forEach(fn=>fn())
      }
    }

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then (onFufilled, onRejected) {
    //解决onFufilled,onRejected没有传值的问题
    onFufilled = typeof onFufilled === 'function'?onFufilled:y=>y
    //因为错误的值要让后面访问到，所以这里也要跑出个错误，不然会在之后then的resolve中捕获
    onRejected = typeof onRejected === 'function'?onRejected:err=>{ throw err ;}
    //声明一个promise对象
    let promise2
    if (this.status === 'resolve') {
      onFufilled(this.value);
    }
    if (this.status === 'reject') {
      onRejected(this.reason);
    }

    if(this.status === 'pendding'){ // ???
      this.onResolvedCallbacks.push(()=>{
        let x = onFufilled(this.value)
        resolvePromise(promise2,x,resolve,reject)
      })
      this.onRejectedCallbacks.push(()=>{
        let x = onRejected(this.reason)
        resolvePromise(promise2,x,resolve,reject)
      })
    }
  }
}

const p = new MyPromise((resolve, reject) => {
  resolve(1);
})
.then(res => {
  console.log('res', res);
})

console.log(p);