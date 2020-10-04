let element = document.documentElement;
let contexts = new Map();
let isListeningMouse = false;

function dispatch(type, properties){
    let event = new Event(type);
    for(let name in properties){
        event[name] = properties[name];
    }
    element.dispatchEvent(event);
}
let start = (point, context) => {
    context.isTap = true;
    context.isPan = false;
    context.isPress = false;
    context.isFlip = false;
    context.startX = point.clientX, context.startY = point.clientY;
    context.points = [{
        t: Date.now(),
        x: point.clientX,
        y: point.clientY
    }]
    context.checkPressHandler = setTimeout(() => {
        context.isTap = false;
        context.isPan = false;
        context.isPress = true;
        console.log("press start");
    }, 500)
}
let move = (point, context) => {
    let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
    if(dx ** 2 + dy ** 2 > 100){
        context.isTap = false;
        context.isPan = true;
        context.checkPressHandler ? clearTimeout(context.checkPressHandler) : clearTimeout(null);
        if(context.isPress){
            console.log("press move", point.clientX, point.clientY);
        }else{
            console.log("pan move", point.clientX, point.clientY);
        }
        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        })
    }

}
let end = (point, context) => {
    context.checkPressHandler ? clearTimeout(context.checkPressHandler) : clearTimeout(null);
    if(context.isTap){
        dispatch("tap", {});
        console.log("tap end");
    }else if(context.isPress){
        dispatch("press", {});
        console.log("press end");
    }else if(context.isPan){
        dispatch("pan", {});
        console.log("pan end");
    }
    context.points = context.points.filter(point => Date.now() - point.t < 500);
    let v = 0;
    if(context.points.length > 0){
        let d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2);
        v = d / (Date.now() - context.points[0].t);
    }
    if(v > 1.5){
        context.isFlip = true;
        dispatch("flip", {});
        console.log("this is a flip action");
    }else{
        context.isFlip = false;
    }
}
let cancel = (point, context) => {
    context.checkPressHandler ? clearTimeout(context.checkPressHandler) : clearTimeout(null);
    // console.log("gesture cancel");
}

element.addEventListener("contextmenu", (event) => {
    event.preventDefault();
})

element.addEventListener("mousedown", (event) => {
    let context = Object.create(null);
    contexts.set("mouse" + (1 << event.button), context);

    start(event, context);
    let mousemove = (event) => {
        let button = 1;
        while(button <= event.buttons){
            if(button & event.buttons){
                let key;
                if(button === 2){
                    key = 4
                }else if(button === 4){
                    key = 2;
                }else{
                    key = button;
                }
                let context = contexts.get("mouse" + key);
                move(event, context);
            }
            button = button << 1;
        }
    }
    let mouseup = (event) => {
        let context = contexts.get("mouse" + (1 << event.button));
        end(event, context);
        contexts.delete("mouse" + (1 << event.button));
        if(event.buttons === 0){
            document.removeEventListener("mousemove", mousemove);
            document.removeEventListener("mouseup", mouseup);
            isListeningMouse = false;
        }
    }
    if(!isListeningMouse){
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
        isListeningMouse = true;
    }
})

element.addEventListener("touchstart", (event) => {
    // event.preventDefault();
    console.log(event.changedTouches);
    for(let touch of event.changedTouches){
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        start(touch, context);
    }
})
element.addEventListener("touchmove", (event) => {
    for(let touch of event.changedTouches){
        let context = contexts.get(touch.identifier);
        move(touch, context);
    }
})
element.addEventListener("touchend", (event) => {
    for(let touch of event.changedTouches){
        let context = contexts.get(touch.identifier);
        end(touch, context);
        contexts.delete(touch.identifier);
    }
})
element.addEventListener("touchcancel", (event) => {
    for(let touch of event.changedTouches){
        let context = contexts.get(touch.identifier);
        cancel(touch, context);
        contexts.delete(touch.identifier);
    }
})


