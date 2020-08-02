const css = require("css");
const EOF = Symbol("EOF");
let currentToken = null;
let currentAttribute = null;
let stack = [{type: "document", children:[]}];
let currentTextNode = null;
let tagReg = /^[a-zA-Z1-6]$/;
const layout = require("./layout.js");

let rules = [];
function addCSSRules(text){
    let ast = css.parse(text);
    // console.log(JSON.stringify(ast, null, "    "));
    rules.push(...ast.stylesheet.rules);
}

function match(element, selector){
    if(!selector || !element.attributes){
        return false;
    }
    if(selector.match(/^#[a-zA-Z0-9_\-]+$/)){
        let attr = element.attributes.filter(attr => attr.name === "id")[0];
        if(attr && attr.value === selector.replace("#", "")){
            return true;
        }
    }else if(selector.match(/^\.[a-zA-Z0-9_\-]+$/)){
        // 支持带空格的class选择器
        let attr = element.attributes.filter(attr => attr.name === "class")[0];
        if(attr){
            let classNames= attr.value;
            let selectorClass = selector.replace(".", "");
            if(classNames.includes(selectorClass)){
                return true;
            }
        }
    }else if(selector.match(/^[a-zA-Z1-6]+$/)){
        if(element.tagName === selector){
            return true;
        }
    }else if(selector.match(/^[a-zA-Z0-9_\-#\.]+$/)){
        // 复合选择器处理流程
        // 先验证是否有tagName
        let flag = false;
        if(selector.match(/^([a-zA-Z1-6]+)/)){
            let tName = RegExp.$1;
            if(element.tagName === tName){
                flag = true;
            }else{
                return false;
            }
        }
        // 验证id
        let idAttr = element.attributes.filter(attr => attr.name === "id")[0];
        let idName = selector.match(/(#[a-zA-Z0-9_\-]+)/g);
        if(idName && !idAttr){
            return false;
        }
        if(idAttr && idName){
            if(idName.length == 1 && idAttr.value === idName[0].replace("#", "")){
                flag = true;
            }else{
                return false;
            }
        }
        // 验证class
        let clsAttr = element.attributes.filter(attr => attr.name === "class")[0];
        let clsName = selector.match(/(\.[a-zA-Z0-9_\-]+)/g);
        if(clsName && !clsAttr){
            return false;
        }
        if(clsAttr && clsName){
            for(let eCls of clsName){
                let classNames= clsAttr.value;
                if(classNames.includes(eCls.replace(".", ""))){
                    flag = true;
                }else{
                    return false;
                }
            }
        }
        return flag;
    }
    return false;
}

function calSpecificity(selector){
    let p = [0, 0, 0, 0];
    let selectorParts = selector.split(" ");
    for(let part of selectorParts){
        if(part.match(/^#[a-zA-Z0-9_\-]+$/)){
            p[1] += 1;
        }else if(part.match(/^\.[a-zA-Z0-9_\-]+$/)){
            p[2] += 1;
        }else if(part.match(/^[a-zA-Z1-6]+$/)){
            p[3] += 1;
        }else if(part.match(/^[a-zA-Z0-9_\-#\.]+$/)){
            if(part.match(/^([a-zA-Z1-6]+)/)){
                p[3] += 1;
            }
            let idSelector = part.match(/#/g);
            if(idSelector && idSelector.length == 1){
                p[1] += 1;
            }
            let clsSelector = part.match(/\./g);
            p[2] += (clsSelector ? clsSelector.length : 0);
        }
    }
    return p;
}

function compare(sp1, sp2){
    if(sp1[0] - sp2[0]){
        return sp1[0] - sp2[0];
    }
    if(sp1[1] - sp2[1]){
        return sp1[1] - sp2[1];
    }
    if(sp1[2] - sp2[2]){
        return sp1[2] - sp2[2];
    }
    return sp1[3] - sp2[3];
}

function computeCSS(element){
    // console.log(rules);
    let elements = stack.slice().reverse();
    if(!element.computedStyle){
        element.computedStyle = {};
    }
    for(let rule of rules){
        let selectorParts = rule.selectors[0].split(" ").reverse();
        if(!match(element, selectorParts[0])){
            continue;
        }
        let matched = false;
        let j = 1;
        for(let i = 0; i < elements.length; i++){
            if(match(elements[i], selectorParts[j])){
                j++;
            }
        }
        if(j >= selectorParts.length){
            matched = true;
        }
        if(matched){
            // console.log("Element", element.tagName, "matched rule", rule.selectors[0]);
            let sp = calSpecificity(rule.selectors[0]);
            let computedStyle = element.computedStyle;
            for(let decl of rule.declarations){
                if(!computedStyle[decl.property]){
                    computedStyle[decl.property] = {}
                }
                if(!computedStyle[decl.property].specificity){
                    computedStyle[decl.property].value = decl.value;
                    computedStyle[decl.property].specificity = sp;
                }else if(compare(computedStyle[decl.property].specificity, sp) < 0){
                    computedStyle[decl.property].value = decl.value;
                    computedStyle[decl.property].specificity = sp;
                }
            }
        }
    }
}

function emit(token){
    // console.log(token);
    let top = stack[stack.length - 1];
    if(token.type == "startTag"){
        let element = {
            type: "element",
            children: [],
            attributes: []
        };
        element.tagName = token.tagName;
        for(let p in token){
            if(p != "type" && p != "tagName"){
                element.attributes.push({
                    name: p,
                    value: token[p]
                });
            }
        }
        computeCSS(element);
        top.children.push(element);
        element.parent = top;
        if(!token.isSelfClosing){
            stack.push(element);
        }
        currentTextNode = null;
    }else if(token.type == "endTag"){
        if(top.tagName != token.tagName){
            console.log("no match");
        }else{
            if(top.tagName === "style"){
                addCSSRules(top.children[0].content);
            }
            layout(top);
            stack.pop();
        }
        currentTextNode = null;
    }else if(token.type == "text"){
        if(currentTextNode == null){
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

function data(c){
    if(c == "<"){
        return tagOpen;
    }else if(c == EOF){
        emit({
            type: "EOF"
        })
        return ;
    }else{
        emit({
            type: "text",
            content: c
        })
        return data;
    }
}
function tagOpen(c){
    if(c == "/"){
        return endTagOpen;
    }else if(c.match(tagReg)){
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        return tagName(c);
    }else{
        return ;
    }
}
function endTagOpen(c){
    if(c.match(tagReg)){
        currentToken = {
            type: "endTag",
            tagName: ""
        }
        return tagName(c);
    }else if(c == ">"){

    }else if(c == EOF){

    }else{

    }
}
function tagName(c){
    if(c.match(/^[\t\f\n ]$/)){
        return beforeAttributeName;
    }else if(c == "/"){
        return selfClosingStartTag;
    }else if(c.match(tagReg)){
        currentToken.tagName += c;
        return tagName;
    }else if(c == ">"){
        emit(currentToken);
        return data;
    }else{
        return tagName;
    }
}
function beforeAttributeName(c){
    if(c.match(/^[\t\f\n ]$/)){
        return beforeAttributeName;
    }else if(c == ">" || c == "/" || c == EOF){
        return afterAttributeName(c);
    }else if(c == "="){

    }else{
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c);
    }
}
function attributeName(c){
    if(c.match(/^[\t\f\n ]$/) || c == "/" || c == ">" || c == EOF){
        return afterAttributeName(c);
    }else if(c == "="){
        return beforeAttributeValue;
    }else if(c == "\u0000"){

    }else if(c == "\"" || c == "'" || c == "<"){

    }else{
        currentAttribute.name += c;
        return attributeName;
    }
}
function afterAttributeName(c){
    if(c.match(/^[\t\f\n ]$/)){
        if(!currentAttribute.value){
            currentAttribute.value = currentAttribute.name;
        }
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: "",
            value: ""
        }
        emit(currentToken);
        return beforeAttributeName(c);
    }else if(c == "/"){
        return selfClosingStartTag;
    }else if(c == ">"){
        if(currentAttribute.name){
            if(!currentAttribute.value){
                currentAttribute.value = currentAttribute.name;
            }
            currentToken[currentAttribute.name] = currentAttribute.value;
            currentAttribute = {
                name: "",
                value: ""
            }
            emit(currentToken);
        }
        return data;
    }else if(c == EOF){

    }else{

    }
}
function beforeAttributeValue(c){
    if(c.match(/^[\t\f\n ]$/) || c == "/" || c == ">" || c == EOF){
        return beforeAttributeValue;
    }else if(c == "\""){
        return doubleQuotedAttributeValue;
    }else if(c == "\'"){
        return singleQuotedAttributeValue;
    }else if(c == ">"){

    }else{
        return unquotedAttributedValue(c);
    }
}
function doubleQuotedAttributeValue(c){
    if(c == "\""){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if(c == "\u0000"){

    }else if(c == EOF){

    }else{
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}
function singleQuotedAttributeValue(c){
    if(c == "\'"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if(c == "\u0000"){

    }else if(c == EOF){

    }else{
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}

function unquotedAttributedValue(c){
    if(c.match(/^[\t\f\n ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    }else if(c == "/"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    }else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(c == "\u0000"){

    }else if(c == "\"" || c == "'" || c == "<" || c == "="){

    }else if(c == EOF){

    }else{
        currentAttribute.value += c;
        return unquotedAttributedValue;
    }
}
function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\f\n ]$/)){
        return beforeAttributeName;
    }else if(c == "/"){
        return selfClosingStartTag;
    }else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(c == EOF){

    }else{

    }
}
function selfClosingStartTag(c){
    if(c == ">"){
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    }else if(c == "EOF"){

    }else{

    }
}

module.exports.parseHtml = function parseHtml(htmlStr){

    let state = data;
    for(let c of htmlStr){
        state = state(c);
    }
    state = state(EOF);
    // 修正自关闭标签，单引号attribute，无引号attribute的错误
    // 增加h1-h6标签的提取
    // 增加类似selected这种没有value的attribute的提取
    return stack[0];
}