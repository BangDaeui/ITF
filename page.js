// express 
const express = require('express');
const app = express();
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

// [Get] /Dashboard (대시보드 페이지)
app.get('/Dashboard', (req, res) => {
    res.render('Dashboard');
})

// [Get] /EventLog (이벤트 로그 페이지)
app.get('/Eventlog', (req, res) => {
    res.render('Eventlog');
})

// [Get] /Users (유저 페이지)
app.get('/Users', (req, res) => {
    res.render('Users');    
})

// [Get] /Dashboard (유저 수정 페이지(추후 Usersettings/Usermanage로 소문자 변경 고려))
app.get('/Usersettings', (req, res) => {
    res.render('Usersettings');
})

// [Get] /Systempolicy (시스템 정책 페이지)
app.get('/Systempolicy', (req, res) => {
    // 시스템 정책의 리스트받아 올 정보
    var sql1 = 'select Policy_No, Policy_Name, Policy_Comment, Policy_Update from Policy';
    conn.query(sql1, function(err, syspolicy, fields){
        res.render('Systempolicy', {
            syspolicy:syspolicy      
        });
    });
})

// [Get] /Systempolicymanage (시스템 수정 페이지)
app.get('/Systempolicymanage/:policyno', (req, res) => {
    var policyno = req.params.policyno;
    // 시스템 정책 세부 정책 Policy_No를 이용해 구분하며 검색
    var sql1 = 'select * from Policy where Policy_No=?';
        conn.query(sql1, [policyno], function(err, syspolicy, fields){
        res.render('Systempolicymanage', {
            syspolicy:syspolicy      
        });
    });
})

// [Post] /Updatesystempolicy (시스템 정책 수정)
app.post('/Updatesystempolicy/:policyno', (req, res) => {
    // policyno = 시스템 정책 번호
    var policyno = req.params.policyno;
    var Policy_Name = req.body.Policy_Name;
    var Policy_Mask = 0;
    var Policy_Taskmgr = req.body.Policy_Taskmgr;
    var Policy_Regedit = req.body.Policy_Regedit;
    var Policy_Cmd = req.body.Policy_Cmd;
    var Policy_Snippingtools = req.body.Policy_Snippingtools;
    var Policy_Usbwrite = req.body.Policy_Usbwrite;
    var Policy_Usbaccess = req.body.Policy_Usbaccess;
    var Policy_Disk = req.body.Policy_Disk;
    var Policy_Clipboard = req.body.Policy_Clipboard;
    
    // System Policy Mask Calculation
    if(Policy_Taskmgr == 1){
        Policy_Mask += 1;
    }
    if(Policy_Regedit == 1){
        Policy_Mask += 2;
    }
    if(Policy_Cmd == 1){
        Policy_Mask += 4;
    }
    if(Policy_Snippingtools == 1){
        Policy_Mask += 8;
    }
    if(Policy_Usbwrite == 1){
        Policy_Mask += 16;
    }
    if(Policy_Usbaccess == 1){
        Policy_Mask += 32;
    }
    if(Policy_Disk == 1){
        Policy_Mask += 64;
    }
    if(Policy_Clipboard == 1){
        Policy_Mask += 128;
    }
    // System Policy Update sql
    var sql1 = 'update Policy set Policy_Mask=?, Policy_Taskmgr=?, Policy_Regedit=?, Policy_Cmd=?, Policy_Snippingtools=?, Policy_Usbwrite=?, Policy_Usbaccess=?, Policy_Disk=?, Policy_Clipboard=? where Policy_No=?';
    
    conn.query(sql1,[Policy_Mask, Policy_Taskmgr, Policy_Regedit, Policy_Cmd, Policy_Snippingtools, Policy_Usbwrite, Policy_Usbaccess, Policy_Disk, Policy_Clipboard, policyno], function(err, tmp, fields){
        console.log(tmp);
    });
    
    res.redirect('/Systempolicy');
})

app.post('/Deletesystempolicy', (req, res) => {
    var id = req.body.checkboxtest;
    console.log(id);
    var sql1 = 'delete from Policy where Policy_No=?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            conn.query(sql1, [items], function (err, result) {});
        });
    } else {
        conn.query(sql1, [id], function (err, result) {});
    }
    res.redirect('/Systempolicy');
});

// [Get] /Folderpolicy (폴더 정책 추가)
app.get('/Folderpolicy', (req, res) => {
    // 폴더 정책에 대한 데이터 베이스 정보 모두 가져오기
    var sql1 = 'select * from Folder';
    conn.query(sql1, function(err, dirpolicy, fields){
        res.render('Folderpolicy', {
            dirpolicy:dirpolicy      
        });
    });
});

// [Get] /Folderpolicymanage (폴더 정책 수정 페이지)
app.get('/Folderpolicymanage/:folderno', (req, res) => {
    // policyno = Folder_No
    var folderno = req.params.folderno;
    // 폴더 정책을 Folder_No을 이용하여 가져온다.
    var sql1 = 'select * from Folder where Folder_No=?';
    conn.query(sql1, [folderno], function(err, dirpolicy, fields){
        res.render('Folderpolicymanage', {
            dirpolicy:dirpolicy      
        });
    });
})

// [Post] /Folderpolicymanage (폴더 정책 수정)
app.post('/Updatefolderpolicy/:folderno', (req, res) => {
    var folderno = req.params.folderno;
    var Folder_Name = req.body.Folder_Name;
    var Folder_Comment = req.body.Folder_Comment;
    var Folder_Update = req.body.Folder_Update;
    var Folder_Readonly = req.body.Folder_Readonly;
    var Folder_Writeable = req.body.Folder_Writeable;
    var Folder_Guest = req.body.Folder_Guest;
    var Folder_Browsable = req.body.Folder_Browsable;
    var Folder_Createmask = req.body.Folder_Createmask;
    var Folder_Directorymask = req.body.Folder_Directorymask;

    // 폴더 정책 업데이트
    var sql1 = 'update Folder set Folder_Name=?, Folder_Comment=?, Folder_Update=?, Folder_Readonly=?, Folder_Writeable=?, Folder_Guest=?, Folder_Browsable=?, Folder_Createmask=?, Folder_Directorymask=? where Folder_No=?';
    conn.query(sql1,[Folder_Name, Folder_Comment, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask, folderno], function(err, tmp, fields){
        console.log(tmp);
    });
    
    res.redirect('/Folderpolicy');
})

app.post('/Deletefolderpolicy', (req, res) => {
    var id = req.body.checkboxtest;
    console.log(id);
    var sql1 = 'delete from Folder where Folder_No=?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items);
            conn.query(sql1, [items], function (err, result) {});
        });
    } else {
        conn.query(sql1, [id], function (err, result) {});
    }
    res.redirect('/Folderpolicy');
});

// [Get] /Setting (설정)
app.get('/Setting', (req, res) => {
    res.render('Setting');
})

// [Get] / (로그인 페이지)
app.get('/', (req, res) => {
    res.render('Login');
})

// Error
app.get('*', function(req, res, next) {
    throw new Error();
});

// Error
app.use(function(error, req, res, next) {
    res.render('Error');
});

module.exports = app;