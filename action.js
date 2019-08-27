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

// ssl/tls screen lock code 
var tls_server1 = tls.createServer(options, function(cleartextStream) {
    //console.log('server connected',
    //  W         cleartextStream.authorized ? 'authorized' : 'unauthorized');
    cleartextStream.on('data', function(data) { 
        // client로 부터 받은 값 console창에 띄우기
        console.log('Received: %s [it is %d bytes long]', 
        data, 
        data.length); 
        // client에서 보낸값 분할 strDate : SMB ID, strPass : Password
        var strData = data.split('αα');
        console.log(strData[1]);
        var strPass = strData[1].split("ΩΩ");
        console.log(strData[0],strPass[0]);
        // client에서 보낸값 확인하여 아이디 패스워드 채킹
        var sql1 = 'select * from Auth where Auth_ID=?';
        // client에서 보낸 ID값을 이용해 Policy_Mask 값, 개인키를 찾아 client에 다시 전송하기 위한 sql
        var sql2 = 'select * from Policy, User, Auth where Auth_ID=? and User_No=Auth_No and User_Policy=Policy_No;'
        // client에 보낼 Folder_Name, Folder_Key 값의 총 갯수 확인
        var sql3 = 'select count(*) as "Count" from Rule,Auth,User where Auth_ID=? and User_No=Auth_No and Rule_User=User_No;'
        // client에 Folder_Name, Folder_Key를 전송하기 위한 sql
        var sql4 = 'select * from Folder, User, Rule, Auth where Auth_ID=? and User_No=Auth_No and Rule_User=User_No and Rule_Folder=Folder_No;'
        conn.query(sql1, [strData[0]], function(err, tmp, fields){
            // console.log(tmp[0].Auth_Pass);
            // client가 ID가 틀릴 경우
            if(tmp.length==0){
                cleartextStream.write("bΩ");
                return;
            }
            // client가 ID를 맞을 경우
            else{
                // client의 Password가 맞을 때
                if(strPass[0] == tmp[0].Auth_Pass){
                    cleartextStream.write("aΩ");
                    // client에 Policy_Mask, User_Key순으로 전송한다.
                    conn.query(sql2, [strData[0]],function(err, tmp, fields){
                        console.log(tmp[0].Policy_Mask);
                        console.log(tmp[0].User_Key);
                        cleartextStream.write(tmp[0].Policy_Mask.toString()+"α");
                        cleartextStream.write(tmp[0].User_Key.toString()+"α");
                        // client에 Folder_Name, Folder_Key의 총 갯수를 보낸다.
                        conn.query(sql3, [strData[0]], function(err, tmp, fields){
                            console.log(tmp[0].Count);
                            cleartextStream.write(tmp[0].Count.toString()+"α");
                            // client에 Folder_Name, Folder_Key를 forEach문을 이용해 보낸다.
                            conn.query(sql4, [strData[0]], function(err, tmp, fields){
                                //console.log(tmp);
                                if(Array.isArray(tmp) == true){
                                    tmp.forEach(function(items, index) {
                                        //console.log(index);
                                        //console.log(tmp[index]);
                                        cleartextStream.write(tmp[index].Folder_Name.toString()+"α");
                                        cleartextStream.write(tmp[index].Folder_Key.toString()+"α");
                                    })
                                    cleartextStream.write("Ω");
                                } else{
                                    cleartextStream.write(tmp[0].Folder_Name.toString()+"α");
                                    cleartextStream.write(tmp[0].Folder_Key.toString()+"α");
                                    cleartextStream.write("Ω");
                                }
                            })
                            
                        })
                    })
                    console.log("성공");
                }
                // client의 Password가 틀릴 경우
                else{
                    console.log("실패");
                    cleartextStream.write("bΩ");
                }
            }
        });
    });
    cleartextStream.on('end', function(){
        console.log("Server end connetion"); 
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
tls_server1.listen(9000, function() {
    console.log('tls_server1 bound');
});

// ssl/tls user log
var tls_server2 = tls.createServer(options, function(cleartextStream) {
    
    cleartextStream.on('data', function(data) { 
        console.log('Received: %s [it is %d bytes long]', 
        data, 
        data.length); 
        // client에서 보낸값 분할 
        var strData = data.split('α');
        console.log(strData[0]);
        strData[1] = strData[1].substring(0,2) + "-" + strData[1].substring(2,4) + "-" + strData[1].substring(4,6) + "-" + strData[1].substring(6,8) + "-" + strData[1].substring(8,10) + "-" + strData[1].substring(10,12);
        var sql1 = 'insert into UserLog(Userlog_Name, Userlog_Mac, Userlog_State, Userlog_IP, Userlog_Time) values(?, ?, ?, ?, DEFAULT)';
        conn.query(sql1, [strData[0], strData[1], strData[2], strData[3]], function(err, Userlog, fields){
            console.log(Userlog);
        })
    });
    cleartextStream.on('end', function(){
        console.log("Server end connetion"); 
    });
    cleartextStream.on('error', function(error) { 
        console.error(error); 
        // Close the connection after the error occurred. 
        cleartextStream.destroy(); 
    });
    cleartextStream.setEncoding('utf8');
    cleartextStream.address();
    
});
tls_server2.listen(9002, function() {
    console.log('tls_server2 bound');
});

// ssl/tls file log
var tls_server3 = tls.createServer(options, function(cleartextStream) {
    cleartextStream.on('data', function(data) { 
        console.log('Received: %s [it is %d bytes long]', 
        data, 
        data.length); 
        // client에서 보낸값 분할
        var strData = data.split('α');
        console.log(strData[0]);
        var Path = strData[1].split(':');
        var sql1 = 'select * from Folder, User, Rule, Auth where Auth_ID=? and User_No=Auth_No and Rule_User=User_No and Rule_Folder=Folder_No';
        var sql2 = 'insert into FileLog(Filelog_Name, Filelog_Path, Filelog_State, Filelog_IP, Filelog_Time) values(?, ?, ?, ?, DEFAULT)';
        var PathCount = 90 - Path[0].charCodeAt(0);
        conn.query(sql1, [strData[0]], function(err, Folder, fields){  
            console.log(Folder);
            if(!PathCount) {
                strData[1] = "/home/" + strData[0] + Path[1].replace(/\\/gi, '/');
            } else {
                strData[1] = Folder[PathCount - 1].Folder_Path + Path[1].replace(/\\/gi, '/'); 
            }
            conn.query(sql2, [strData[0], strData[1], strData[2], strData[3]], function(err, Filelog, fields){
                console.log(Filelog);
            });
        });
    });
    cleartextStream.on('end', function(){
        console.log("Server end connetion"); 
    });
    cleartextStream.on('error', function(error) { 
        console.error(error); 
        // Close the connection after the error occurred. 
        cleartextStream.destroy(); 
    });
    cleartextStream.setEncoding('utf8');
    cleartextStream.address();
});
tls_server3.listen(9003, function() {
    console.log('tls_server3 bound');
});


module.exports = app;