export function createElement(type, attrs, ...children){
    let ele;
    if(typeof type === "string"){
        ele = new ElementWrapper(type);
    }else{
        ele = new type;
    }
    for(let name in attrs){
        ele.setAttribute(name, attrs[name]);
    }
    for(let child of children){
        if(typeof child === "string"){
            child = new TextWrapper(child);
        }
        child.mountTo(ele);
    }
    return ele;
}
export class component{
    constructor() {
        this.root;
    }
    setAttribute(name, value){
        this.root.setAttribute(name, value);
    }
    appendChild(child){
        this.root.appendChild(child);
    }
    mountTo(parent){
        parent.appendChild(this.root)
    }
}
class ElementWrapper extends component{
    constructor(type){
        super();
        this.root = document.createElement(type);
    }
}
class TextWrapper extends component{
    constructor(content){
        super()
        this.root = document.createTextNode(content);
    }
}
