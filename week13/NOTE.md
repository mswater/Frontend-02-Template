学习笔记
本周我认为最重要的是了解了requestAnimationFrame的用法，我总结的基本框架如下：
```javascript
let timer;
btn.addEventListener("click", function(){
    cancelAnimationFrame(timer);
    timer = requestAnimationFrame(function tick(){
        if(true){  //此处为判断条件
            requestAnimationFrame(tick);
        }else{
            cancelAnimationFrame(timer);
        }
    })
})
```

关于老师其他的代码内容，个人感觉在学习过程中，我们犹如提线木偶，不知道下一步要做什么，也不知道要达到什么目的，就只能按着老师的步骤照猫画虎。体验不太好，我自己提炼了这周课程的重点，个人认为还是动画的coding。