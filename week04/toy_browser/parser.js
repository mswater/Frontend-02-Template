const EOF = Symbol("EOF");
let currentToken = null;
let currentAttribute = null;
let stack = [{type: "document", children:[]}];
let currentTextNode = null;
let tagReg = /^[a-zA-Z1-6]$/;

function emit(token){
    console.log(token);
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
    console.log(htmlStr);
    let state = data;
    for(let c of htmlStr){
        state = state(c);
    }
    state = state(EOF);
    // 修正自关闭标签，单引号attribute，无引号attribute的错误
    // 增加h1-h6标签的提取
    // 增加类似selected这种没有value的attribute的提取
    console.log(stack[0]);
}