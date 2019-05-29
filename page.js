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
    res.render('Systempolicy');
})

app.get('/Folderpolicy', (req, res) => {
    res.render('Folderpolicy');
})

app.get('/Setting', (req, res) => {
    res.render('Setting');
})

app.get('/', (req, res) => {
    res.render('Dashboard');
})

module.exports = app;