// express
const express = require('express');
const app = express();

var page = require('./page');
var action = require('./action');
app.use('/', page);
app.use('/', action);

app.listen(3000, () => console.log('ITF Server Started'));