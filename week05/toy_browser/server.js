const http = require('http');

http.createServer(function(request, response){
    let body = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);//这里去掉了toString() 方法，因为后面会报错
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log('body:', body);
        response.setHeader('Content-Type', 'text/html');
        response.setHeader('X-Foo', 'bar');
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end(`
<html maaa="a">
<head>
    <title>toy browser</title>
    <style>
    body #main{
        width:500px; height:300px; background: rgb(255, 255, 255); display: flex;
    }
    #main #myid{
        width: 200px; height:100px; background: rgb(255, 0, 0)
    }
    #main .right_part{
        flex:1; background: rgb(0, 255, 0);
    }
    p{
        background: blue;
    }
    div .para_normal.big{
        font-size:20px;
    }
    div p#myPara{
        font-size:14px;
    }
    div p#myPara2.high_para.small{
        font-size:10px;
        color: grey;
    }
    div #myPara2.high_para{
        font-size:12px;
    }
    </style>
</head>
<body>
    <div id='main'>
        <div id="myid"></div>
        <div class="right_part"></div>
    </div>
    <div>
        <p class="para_normal big">big paragraph</p>
        <p id="myPara">normal</p>
        <p id="myPara2" class="high_para small">small paragraph</p>
    </div>
</body>
</html>`);
    });
}).listen(8088);

console.log('server started');
