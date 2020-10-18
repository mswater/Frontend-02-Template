import {createElement} from "./utils";
import {Carousel} from "./carousel";
import {TimeLine, Animation} from "./animation";


let imgs = [
    {
        img: "https://static001.geekbang.org/resource/image/5e/99/5e7d4397ea2132f36edc3520ed2ee999.jpg",
        url: "https://time.geekbang.org/"
    },
    {
        img: "https://static001.geekbang.org/resource/image/0b/8d/0bcfbb2c37af50885a451cb4f357198d.jpg",
        url: "https://time.geekbang.org/"
    },
    {
        img: "https://static001.geekbang.org/resource/image/c3/c4/c3e82b4147b77cb0e3524f902d6885c4.jpg",
        url: "https://time.geekbang.org/"
    },
    {
        img: "https://static001.geekbang.org/resource/image/00/c2/007bd0d8c59fb84af128e2116b7355c2.jpg",
        url: "https://time.geekbang.org/"
    }
]
let carousel = <Carousel src={imgs}
                         onChange={event => console.log(event.detail.position)}
                         onClick={event => window.location.href = event.detail.data.url}
></Carousel>
carousel.mountTo(document.body);

