function getStyle(element){
    if(!element.cStyle){
        element.cStyle = {};
    }
    for(let prop in element.computedStyle){
        let p = element.computedStyle.value;
        element.cStyle[prop] = element.computedStyle[prop].value;
        if(element.cStyle[prop].toString().match(/px$/)){
            element.cStyle[prop] = parseInt(element.cStyle[prop]);
        }
        if(element.cStyle[prop].toString().match(/^[0-9\.]+$/)){
            element.cStyle[prop] = parseInt(element.cStyle[prop]);
        }
    }
    return element.cStyle;
}

function layout(element){
    if(!element.computedStyle){
        return ;
    }
    let elementStyle = getStyle(element);
    if(elementStyle.display !== "flex"){
        return ;
    }
    let items = element.children.filter(e => e.type === "element");
    items.sort(function(a, b){
        return (a.order || 0) - (b.order || 0);
    });
    let eStyle = elementStyle;
    ["width", "height"].forEach(size => {
        if(eStyle[size] === "auto" || eStyle[size] === ""){
            eStyle[size] = null;
        }
    })
    if(!eStyle.flexDirection || eStyle.flexDirection === "auto"){
        eStyle.flexDirection = "row";
    }
    if(!eStyle.alignItems || eStyle.alignItems === "auto"){
        eStyle.alignItems = "stretch";
    }
    if(!eStyle.justifyContent || eStyle.justifyContent === "auto"){
        eStyle.justifyContent = "flex-start";
    }
    if(!eStyle.flexWrap || eStyle.flexWrap === "auto"){
        eStyle.flexWrap = "nowrap";
    }
    if(!eStyle.alignContent || eStyle.alignContent === "auto"){
        eStyle.alignContent = "stretch";
    }
    let mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;
    if(eStyle.flexDirection === "row"){
        mainSize = "width";
        mainStart = "left";
        mainEnd = "right";
        mainSign = +1;
        mainBase = 0;
        crossSize = "height";
        crossStart = "top";
        crossEnd = "bottom";
    }
    if(eStyle.flexDirection === "row-reverse"){
        mainSize = "width";
        mainStart = "right";
        mainEnd = "left";
        mainSign = -1;
        mainBase = eStyle.width;
        crossSize = "height";
        crossStart = "top";
        crossEnd = "bottom";
    }
    if(eStyle.flexDirection === "column"){
        mainSize = "height";
        mainStart = "top";
        mainEnd = "bottom";
        mainSign = +1;
        mainBase = 0;
        crossSize = "width";
        crossStart = "left";
        crossEnd = "right";
    }
    if(eStyle.flexWrap === "wrap-reverse"){
        let tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    }else{
        crossBase = 0;
        crossSign = 1;
    }

    let isAutoMainSize = false;
    if(!eStyle[mainSize]){
        elementStyle[mainSize] = 0;
        for(let i = 0; i < items.length; i++){
            let item = items[i];
            let itemStyle = getStyle(item);
            if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)){
                elementStyle[mainSize] += itemStyle[mainSize];
            }
        }
        isAutoMainSize = true;
    }

    let flexLine = [];
    let flexLines = [flexLine];
    let mainSpace = elementStyle[mainSize];
    let crossSpace = 0;
    for(let i = 0; i < items.length; i++){
        let item = items[i];
        let itemStyle = getStyle(item);
        if(itemStyle[mainSize] === null){
            itemStyle[mainSize] = 0;
        }
        if(itemStyle.flex){
            flexLine.push(item);
        }else if(eStyle.flexWrap === "nowrap" && isAutoMainSize){
            mainSpace -= itemStyle[mainSize];
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        }else{
            if(itemStyle[mainSize] > eStyle[mainSize]){
                itemStyle[mainSize] = eStyle[mainSize];
            }
            if(mainSpace < itemStyle[mainSize]){
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = eStyle[mainSize];
                crossSpace = 0;
            }else{
                flexLine.push(item);
            }
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            mainSpace -= itemStyle[mainSize];
        }
    }
    flexLine.mainSpace = mainSpace;

    if(eStyle.flexWrap === "nowrap" || isAutoMainSize){
        flexLine.crossSpace = (eStyle[crossSize] !== undefined) ? eStyle[crossSize] : crossSpace;
    }else{
        flexLine.crossSpace = crossSpace;
    }

    if(mainSpace < 0){
        let scale = eStyle[mainSize] / (eStyle[mainSize] - mainSpace);
        let currentMain = mainBase;
        for(let i = 0; i < items.length; i++){
            let item = items[i];
            let itemStyle = getStyle(item);
            if(itemStyle.flex){
                itemStyle[mainSize] = 0;
            }
            itemStyle[mainSize] = itemStyle[mainSize] * scale;
            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    }else{
        flexLines.forEach(function(items){
            let mainSpace = items.mainSpace;
            let flexTotal = 0;
            for(let i = 0; i < items.length; i++){
                let item = items[i];
                let itemStyle = getStyle(item);
                if((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))){
                    flexTotal += itemStyle.flex;
                    continue;
                }
            }
            if(flexTotal > 0){
                let currentMain = mainBase;
                for(let i = 0; i < items.length; i++){
                    let item = items[i];
                    let itemStyle = getStyle(item);
                    if(itemStyle.flex){
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                    }
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
            }else{
                let currentMain = 0;
                let step = 0;
                if(eStyle.justifyContent === "flex-start"){
                    currentMain = mainBase;
                    step = 0;
                }
                if(eStyle.justifyContent === "flex-end"){
                    currentMain = mainSpace * mainSign + mainBase;
                    step = 0;
                }
                if(eStyle.justifyContent === "center"){
                    currentMain = mainSpace / 2 * mainSign + mainBase;
                    step = 0;
                }
                if(eStyle.justifyContent === "space-between"){
                    step = mainSpace / (items.length - 1) * mainSign;
                    currentMain = mainBase;
                }
                if(eStyle.justifyContent === "space-around"){
                    step = mainSpace / items.length * mainSign;
                    currentMain = step / 2 + mainBase;
                }
                for(let i = 0; i < items.length; i++){
                    let item = items[i];
                    let itemStyle = getStyle(item);
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        })
    }
    if(!eStyle[crossSize]){
        crossSpace = 0;
        elementStyle[crossSize] = 0;
        for(let i = 0; i < flexLines.length; i++){
            elementStyle[crossSize] += flexLines[i].crossSpace;
        }
    }else{
        crossSpace = eStyle[crossSize];
        for(let i = 0; i < flexLines.length; i++){
            crossSpace -= flexLines[i].crossSpace;
        }
    }
    if(eStyle.flexWrap === "wrap-reverse"){
        crossBase = eStyle[crossSize];
    }else{
        crossBase = 0;
    }
    let lineSize = eStyle[crossSize] / flexLines.length;
    let step;
    if(eStyle.alignContent === "flex-start"){
        crossBase += 0;
        step = 0;
    }
    if(eStyle.alignContent === "flex-end"){
        crossBase += crossSign * crossSpace;
        step = 0;
    }
    if(eStyle.alignContent === "center"){
        crossBase += crossSign * crossSpace / 2;
        step = 0;
    }
    if(eStyle.alignContent === "space-between"){
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }
    if(eStyle.alignContent === "space-around"){
        step = crossSpace / flexLines.length;
        crossBase += crossSign * step / 2;
    }
    if(eStyle.alignContent === "stretch"){
        crossBase += 0;
        step = 0;
    }
    flexLines.forEach(function(items){
        let lineCrossSize = eStyle.alignContent === "stretch" ?
            items.crossSpace + crossSpace / flexLines.length :
            items.crossSpace;
        for(let i = 0; i < items.length; i++){
            let item = items[i];
            let itemStyle = getStyle(item);
            let align = itemStyle.alignSelf || eStyle.alignItems;
            if(item === null){
                itemStyle[crossSize] = (align === "stretch") ?
                    lineCrossSize : 0;
            }
            if(align === "flex-start"){
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align === "flex-end"){
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
            }
            if(align === "center"){
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align === "stretch"){
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize] : lineCrossSize);
                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
            }
        }
        crossBase += crossSign * (lineCrossSize + step);
    });
    console.log(items)
}

module.exports = layout;