import {createElement} from "./utils";
import {Carousel} from "./carousel";
import {TimeLine, Animation} from "./animation";


let imgs = [
    "https://static001.geekbang.org/resource/image/5e/99/5e7d4397ea2132f36edc3520ed2ee999.jpg",
    "https://static001.geekbang.org/resource/image/0b/8d/0bcfbb2c37af50885a451cb4f357198d.jpg",
    "https://static001.geekbang.org/resource/image/c3/c4/c3e82b4147b77cb0e3524f902d6885c4.jpg",
    "https://static001.geekbang.org/resource/image/00/c2/007bd0d8c59fb84af128e2116b7355c2.jpg"
]
let carousel = <Carousel src={imgs}></Carousel>
// document.body.appendChild(div);
carousel.mountTo(document.body);

let tl = new TimeLine();
tl.add(new Animation({set a(v) {console.log(v)}}, "a", 0, 100, 1000, 0, null));
tl.start();
console.log("webpack-dev-server")