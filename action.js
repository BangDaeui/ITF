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

// sql connection
var conn = mysql.createConnection({
    host: 'itf2019.cohnbkqepvge.ap-northeast-2.rds.amazonaws.com',
    user: 'itf2019',
    password: 'kit2019!',
    database: 'itf',
})
conn.connect();

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