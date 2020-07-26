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
    <title></title>
    <style>
    body{
        width:100%;height:100%;
    }
    </style>
</head>
<body>
    <div id='main'>
        <a href="123" />
        <h2 title=num>title</h2>
        <p>content</p>
        <select>
            <option selected>1</option>
        </select>
    </div>
</body>
</html>`);
    });
}).listen(8000);

console.log('server started');
