学习笔记
####这次笔记主要记录一下flex布局
####下面是一些示例
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>test flex 3</title>
    <style type="text/css">
        body{
            display:flex;
            margin:0;
            padding:0;
            width:100%;
            min-height:600px;
            flex-direction:column;
        }
        header, footer{
            width:100%;
            height:30px;
            background:grey;
        }
        .content{
            flex:auto;
            display:flex;
        }
        main{
            flex:auto;
        }
        nav, aside{
            flex:0 0 10%;
            background:red;
        }
        aside{
            order:-1;
        }
    </style>
</head>
<body>
<header></header>
<div class="content">
    <main class="main-con"></main>
    <nav></nav>
    <aside></aside>
</div>
<footer></footer>
</body>
</html>
 ```