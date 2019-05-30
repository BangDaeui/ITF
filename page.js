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

app.get('/Usersettings', (req, res) => {
    res.render('Usersettings');
})

app.get('/Dashboard', (req, res) => {
    res.render('Dashboard');
})

app.get('/Eventlog', (req, res) => {
    res.render('Eventlog');
})

app.get('/Users', (req, res) => {
    res.render('Users');
    
})

app.get('/Systempolicy', (req, res) => {
    var sql1 = 'select Policy_No, Policy_Name, Policy_Comment, Policy_Update from Policy';
    conn.query(sql1, function(err, tmp, fields){
        res.render('Systempolicy', {
            tmp:tmp      
        });
    });
})

app.get('/Folderpolicymanage', (req, res) => {
    res.render('Folderpolicymanage');
app.get('/Systempolicy_Manage/:policyid', (req, res) => {
    var policyid = req.params.policyid;
    var sql1 = 'select * from Policy where Policy_No=?';
        conn.query(sql1, [policyid], function(err, tmp, fields){
        res.render('Systempolicy_Manage', {
            tmp:tmp      
        });
    });
    //res.render('Systempolicy_Manage');
})

app.post('/Systempolicy_Manage',(req,res)=>{
    var Policy_Name = req.body.Policy_Name;
    var Policy_Mask = 0;
    var Policy_Taskmgr = req.body.taskmgr;
    var Policy_Regedit = req.body.regedit;
    var Policy_Cmd = req.body.cmd;
    var Policy_Snipping = req.body.snipping;
    var Policy_Usbwrite = req.body.usbwrite;
    var Policy_Usbaccess = req.body.usbaccess;
    var Policy_Disk = req.bocy.disk;
    var Policy_Clipboard = req.body.clipboard;
    
    if(Policy_Taskmgr == 1){
        Policy_Mask += 1;
    }
    if(Policy_Regedit == 1){
        Policy_Mask += 2;
    }
    if(Policy_Cmd == 1){
        Policy_Mask += 4;
    }
    if(Policy_Snipping == 1){
        Policy_Mask += 8;
    }
    if(Policy_Write == 1){
        Policy_Mask += 16;
    }
    if(Policy_Access == 1){
        Policy_Mask += 32;
    }
    if(Policy_Disk == 1){
        Policy_Mask += 64;
    }
    if(Policy_Clipboard == 1){
        Policy_Mask += 128;
    }
    
    var sql = 'update Policy set Policy_Mask=?, Policy_Taskmgr=?, Policy_Regedit=?, Policy_Cmd=?, Policy_Snipping=?, Policy_Usbwrite=?, Policy_Usbaccess=?, Policy_Disk=?, Policy_Clipboard=?';
    
    conn.query(sql,[Policy_Mask, Policy_Control, Policy_Taskmgr, Policy_Regedit, Policy_Cmd, Policy_Snipping, Policy_Usbwrite, Policy_Usbaccess, Policy_Clipboard, ],function(err, tmp, fields){
    console.log(tmp);
    res.redirect('/Systempolicy');
    });
    
})
app.get('/Folderpolicy', (req, res) => {
    res.render('Folderpolicy');
})

app.get('/Setting', (req, res) => {
    res.render('Setting');
})

app.get('/', (req, res) => {
    res.render('Login');
})

module.exports = app;