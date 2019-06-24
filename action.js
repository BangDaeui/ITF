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
// handlebars
const exphbs = require('express-handlebars');
// path
const path = require('path'); 
// randomstring
const randomstring = require("randomstring");
// tls
const tls = require('tls');
// fs
const fs = require('fs');

// sql connection
var conn = mysql.createConnection({
    host: 'itf2019.cohnbkqepvge.ap-northeast-2.rds.amazonaws.com',
    user: 'itf2019',
    password: 'kit2019!',
    database: 'itf',
})
conn.connect();
// Certificate Make
var options = {
  pfx: fs.readFileSync('SslTcpServer2_TemporaryKey.pfx'),
  passphrase: '123123'    
  // 클라이언트 인증서 인증(certificate authentication)을 사용할 때만 필요하다.

};
// Random Key
var random = randomstring.generate({
    charset: 'alphanumeric',
    length: 256
});
// View engine setup
app.engine('handlebars', exphbs({
    defaultLayout: false
}));
app.set('view engine', 'handlebars');

// code pretty
app.locals.pretty = true;

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());
app.use(bodyParser.text());

// ssl/tls
var tls_server = tls.createServer(options, function(cleartextStream) {
    //console.log('server connected',
    //            cleartextStream.authorized ? 'authorized' : 'unauthorized');
    cleartextStream.on('data', function(data) { 
        console.log('Received: %s [it is %d bytes long]', 
        data, 
        data.length); 
        var strData = data.split('%%');
        var strPass = strData[1].split("$$");
        console.log(strData[0],strPass[0]);
        var sql1 = 'select * from Auth where Auth_ID=?';
        conn.query(sql1,[strData[0]], function(err, tmp, fields){
            //console.log(tmp[0].Auth_Pass);
            if(tmp.length==0){
                cleartextStream.write("b$");
                return;
            }else{
                if(strPass[0] == tmp[0].Auth_Pass){
                    console.log("성공");
                    cleartextStream.write("a$");
                    cleartextStream.write(random+"$");
                }else{
                    console.log("실패");
                    cleartextStream.write("b$");
                }
            }
        });
        

    }); 
    cleartextStream.on('error', function(error) { 
        console.error(error); 
        // Close the connection after the error occurred. 
        cleartextStream.destroy(); 
    });
    cleartextStream.setEncoding('utf8');
    cleartextStream.address();
    //console.log(cleartextStream);
});
tls_server.listen(9000, function() {
    console.log('server bound');
});

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

module.exports = app;