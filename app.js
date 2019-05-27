// express 
const express = require('express');
const app = express();
app.use(express.static('public'));
// socket
const net = require('net');
// mysql
const mysql = require('mysql');
// body-parser
const bodyParser = require('body-parser');



// sql connection
var conn = mysql.createConnection({
    host: 'itf1234.cohnbkqepvge.ap-northeast-2.rds.amazonaws.com',
    user: 'itf',
    password: 'kit2019!',
    database: 'SANHAE',
})
conn.connect();

// Body Parser Middleware
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());
app.use(bodyParser.text());

// net socket
var server = net.createServer(function(client){
    console.log('Client connected');

    client.on('data', function(data){
        console.log('Client sent ' + data.toString());
    });
    client.on('end',function(){
        console.log('Client disconnected');
    });
    var sql = 'select a10 from hello';
    conn.query(sql,function(err, tmp, fields){
        console.log(tmp[0].a10);
        client.write(tmp[0].a10.toString());
    });
});
server.listen(7777, function(){
    console.log('Server listening for connections');
});

app.listen(3000, () => console.log('server started...'));

app.get('/',function(req, res){
    res.send('/public/index.html');
})

app.post('/data', function(req, res){
    var a2=req.body.control;
    var a3=req.body.regedit;
    var a4=req.body.cmd;
    var a5=req.body.sniffing;
    var a6=req.body.write;
    var a7=req.body.access;
    var a8=req.body.disk;
    var a9=req.body.clipboard;
    var result=0;

    if(a2==1){
        result+=1;
    }
    if(a3==1){
        result+=2;
    }
    if(a4==1){
        result+=4;
    }
    if(a5==1){
        result+=8;
    }
    if(a6==1){
        result+=16;
    }
    if(a7==1){
        result+=32;
    }
    if(a8==1){
        result+=64;
    }
    if(a9==1){
        result+=128;
    }
    
    var sql='update hello set a2=?, a3=?, a4=?, a5=?, a6=?, a7=?, a8=?, a9=?, a10=?';
    conn.query(sql,[a2,a3,a4,a5,a6,a7,a8,a9,result],function(err, tmp, fields){
        console.log(tmp);
        res.redirect('/');
    });
})