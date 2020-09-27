import {component} from "./utils";

export class Carousel extends component{
    constructor(){
        super();
        this.data = Object.create(null)
    }
    setAttribute(name, value){
        this.data[name] = value;
    }
    init(){
        this.root = document.createElement("div");
        this.root.classList.add("carousel");
        for(let imgSrc of this.data.src){
            let imgPart = document.createElement("div");
            imgPart.style.backgroundImage = `url("${imgSrc}")`;
            this.root.appendChild(imgPart);
        }
        return this.root;
    }
    show(){
        let currentIndex = 0;
        let nextIndex;
        let children = this.root.children;
        let intervalHandler = (direction) => {
            direction = direction ? direction : -1;
            nextIndex = direction == 1 ? (currentIndex - 1 >= 0 ? currentIndex - 1 : children.length - 1) : (currentIndex + 1) % children.length;
            children[nextIndex].style.transition = "none";
            children[nextIndex].style.transform = `translateX(${-nextIndex*100-direction*100}%)`;
            setTimeout(() => {
                children[nextIndex].style.transition = "";
                children[currentIndex].style.transform = `translateX(${direction*100-currentIndex*100}%)`;
                children[nextIndex].style.transform = `translateX(${-nextIndex*100}%)`;
                currentIndex = nextIndex;
            }, 16)
        }
        let intervalId = setInterval(intervalHandler, 3000);
        this.root.addEventListener("mousedown", (event) => {
            clearInterval(intervalId);
            let startX = event.clientX;
            let move = function(event){
                console.log(startX, event.clientX);
                let moveX = event.clientX - startX;
                if(moveX == 0){
                    return ;
                }
                nextIndex = moveX > 0 ? (currentIndex - 1 >= 0 ? currentIndex - 1 : children.length - 1) : (currentIndex + 1) % children.length;
                let direction = moveX > 0 ? +1 : -1;
                children[nextIndex].style.transition = "none";
                children[nextIndex].style.transform = `translateX(${-nextIndex*100-direction*100}%)`;
                setTimeout(() => {
                    let width = children[currentIndex].getBoundingClientRect().width;
                    children[currentIndex].style.transition = "none";
                    children[currentIndex].style.transform = `translateX(${-currentIndex*width+moveX}px)`;
                    children[nextIndex].style.transition = "none";
                    children[nextIndex].style.transform = `translateX(${-nextIndex*width-direction*width+moveX}px)`;
                }, 16)
            }
            let up = function(event){
                let moveX = event.clientX - startX;
                if(moveX > 0){
                    nextIndex = moveX > 0 ? (currentIndex - 1 >= 0 ? currentIndex - 1 : children.length - 1) : (currentIndex + 1) % children.length;
                    let direction = moveX > 0 ? +1 : -1;
                    children[currentIndex].style.transition = "";
                    children[nextIndex].style.transition = "";
                    children[currentIndex].style.transform = `translateX(${direction*100-currentIndex*100}%)`;
                    children[nextIndex].style.transform = `translateX(${-nextIndex*100}%)`;
                    currentIndex = nextIndex;
                }
                setTimeout(() => {
                    intervalId = setInterval(intervalHandler, 3000);
                }, 3000)
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", up);
            }
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", up);
        })
    }
    mountTo(parent) {
        parent.appendChild(this.init());
        // this.show();
    }
}