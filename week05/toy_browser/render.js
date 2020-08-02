const images = require("images");

function render(viewport, element){
    if(element.cStyle){
        let img = images(element.cStyle.width, element.cStyle.height);
        if(element.cStyle["background"]){
            let color = element.cStyle["background"] || "rgb(0, 0, 0)";
            color.match(/rgb\((\d+), (\d+), (\d+)\)/);
            img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));
            viewport.draw(img, element.cStyle.left || 0, element.cStyle.top || 0);
        }
    }

    if(element.children){
        for(let child of element.children){
            render(viewport, child);
        }
    }
}

module.exports = render;