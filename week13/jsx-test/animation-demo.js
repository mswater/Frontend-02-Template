import {TimeLine, Animation} from "./animation.js";


let tl = new TimeLine();
let moveEl = document.getElementById("movePart");
tl.add(new Animation(moveEl.style, "transform", 0, 500, 3000, 0, null, v => {return `translateX(${v}px)`}));


document.getElementById("beginBtn").addEventListener("click", () => {
    tl.start();
    let el = document.getElementById("anoMovePart");
    el.style.transform = "translateX(500px)";
    el.style.transition = "transform 3s ease";
})
document.getElementById("pauseBtn").addEventListener("click", () => {
    tl.pause();
})
document.getElementById("resumeBtn").addEventListener("click", function(){
    tl.resume();
})