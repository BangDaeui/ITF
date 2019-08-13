var os = require('os');


console.log(os.type());         // 운영체제 이름

if (os.type == 'Windows_NT' && 1)
    console.log(1);