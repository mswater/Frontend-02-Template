学习笔记
```javascript
const promise = new Promise(function(resolve, reject){
    if(success){
        //这里可以传递异步执行成功后的结果，也可以传递其他的对象，比如另一个Promise实例
        resolve(result);
    }
    if(failed){
        reject(new Error('failed'));
    }
})
promise.then(function(result){
    //result为上面异步执行成功后的结果，可以这样传递
    console.log(result);
    //这里还可以有返回值，这个返回值可以是普通值，也可以是另一个Promise对象，可以传递给下一个then
    rerurn result2;
}, function(error){//可选，常用catch代替
    //Error对象的实例
    console.log(error)
}).then(function(result2){
    console.log(result2);
}).catch(function(error){
    //用于处理错误
    //catch 可以用来处理错误，then的第二个函数也可以用来处理错误，这两个方法等效
    //但是建议使用catch处理错误情况，以便catch到前面then方法执行中的错误
}).finally(function(){
    //必然会执行的操作
})
```