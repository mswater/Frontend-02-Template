import {component} from "./utils";
import {enableGesture} from "./gesture";
import {TimeLine, Animation} from "./animation";
import {ease} from "./ease";

export class Carousel extends component{
    constructor(){
        super();
    }
    init(){
        this.root = document.createElement("div");
        this.root.classList.add("carousel");
        for(let imgSrc of this.data.src){
            let imgPart = document.createElement("div");
            imgPart.style.backgroundImage = `url("${imgSrc.img}")`;
            this.root.appendChild(imgPart);
        }
        enableGesture(this.root);
        return this.root;
    }
    show(){
        let currentIndex = 0;
        let children = this.root.children;
        let width = children[currentIndex].getBoundingClientRect().width;
        // 开始使用rAF实现动画
        let tl = new TimeLine();
        tl.start();
        // 循环添加动画进入tl队列
        let nextIndex;
        let intervalHandler = (direction) => {
            direction = direction ? direction : -1;
            nextIndex = direction == 1 ? (currentIndex - 1 >= 0 ? currentIndex - 1 : children.length - 1) : (currentIndex + 1) % children.length;
            children[nextIndex].style.transition = "none";
            children[nextIndex].style.transform = `translateX(${(-nextIndex-direction)*width}px)`;
            tl.add(new Animation(children[currentIndex].style, "transform", -currentIndex*width,(direction-currentIndex)*width,500,0, ease, v => `translateX(${v}px)`));
            tl.add(new Animation(children[nextIndex].style, "transform", (-direction-nextIndex)*width,(-nextIndex)*width,500,0, ease, v => `translateX(${v}px)`));
            currentIndex = nextIndex;
            this.triggerEvent("Change", {position: currentIndex});
        }
        let intervalId = setInterval(intervalHandler, 3000);

        this.root.addEventListener("gesturestart", (event) => {
            tl.pause();
            clearInterval(intervalId);
        })
        this.root.addEventListener("tap", (event) => {
            this.triggerEvent("Click", {
                data: this.data.src[currentIndex],
                position: currentIndex
            })
        })
        this.root.addEventListener("panmove", (event) => {
            let moveX = event.clientX - event.startX;
            nextIndex = moveX > 0 ? (currentIndex - 1 >= 0 ? currentIndex - 1 : children.length - 1) : (currentIndex + 1) % children.length;
            let direction = moveX > 0 ? +1 : -1;
            children[nextIndex].style.transition = "none";
            children[nextIndex].style.transform = `translateX(${(-nextIndex-direction)*width}px)`;
            setTimeout(() => {
                children[currentIndex].style.transition = "none";
                children[currentIndex].style.transform = `translateX(${-currentIndex*width+moveX}px)`;
                children[nextIndex].style.transition = "none";
                children[nextIndex].style.transform = `translateX(${-nextIndex*width-direction*width+moveX}px)`;
            }, 16)
        });
        this.root.addEventListener("panend", (event) => {
            tl.reset();
            tl.start();
            intervalId = setInterval(intervalHandler, 3000);
            let moveX = event.clientX - event.startX;
            nextIndex = moveX > 0 ? (currentIndex - 1 >= 0 ? currentIndex - 1 : children.length - 1) : (currentIndex + 1) % children.length;
            let direction = moveX > 0 ? +1 : -1;
            tl.add(new Animation(children[currentIndex].style, "transform", -currentIndex*width+moveX,(direction-currentIndex)*width,500,0, ease, v => `translateX(${v}px)`));
            tl.add(new Animation(children[nextIndex].style, "transform", (-direction-nextIndex)*width+moveX,-nextIndex*width,500,0, ease, v => `translateX(${v}px)`));
            currentIndex = nextIndex;
            this.triggerEvent("Change", {position: currentIndex});
        })
    }
    mountTo(parent) {
        parent.appendChild(this.init());
        this.show();
    }
}
