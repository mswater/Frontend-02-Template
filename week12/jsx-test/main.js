import {createElement, component} from "./utils";

class Carousel extends component{
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
        this.show();
    }
}
let imgs = [
    "https://static001.geekbang.org/resource/image/5e/99/5e7d4397ea2132f36edc3520ed2ee999.jpg",
    "https://static001.geekbang.org/resource/image/0b/8d/0bcfbb2c37af50885a451cb4f357198d.jpg",
    "https://static001.geekbang.org/resource/image/c3/c4/c3e82b4147b77cb0e3524f902d6885c4.jpg",
    "https://static001.geekbang.org/resource/image/00/c2/007bd0d8c59fb84af128e2116b7355c2.jpg"
]
let carousel = <Carousel src={imgs}></Carousel>
console.log("webpack-dev-server");
// document.body.appendChild(div);
carousel.mountTo(document.body);