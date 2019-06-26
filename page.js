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
// cookie-parser
var cookie = require('cookie-parser');

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

// use cookie-parser
app.use(cookie('!@$!@#!@#'));

// [Post] /Login (대시보드 페이지)
app.post('/Login', (req, res) => {
    var id = req.body.ID;
    var password = req.body.Pass;
    res.cookie('ITF', 2, {
        signed: true
    });
    // 로그인에 필요한 정보
    var sql1 = 'select * from WebAuth where WebAuth_ID = ?';
    conn.query(sql1, [id], function (err, WebAuth, fields) {
        if (password == WebAuth[0].WebAuth_Pass) {
            res.cookie('ITF', WebAuth[0].WebAuth_No, {
                signed: true
            });
            res.redirect('/Dashboard');
        } else {
            res.redirect('/');
        }
    });
})

// [Get] /Logout (대시보드 페이지)
app.get('/Logout', (req, res) => {
    res.cookie('ITF', 0, {
        signed: true
    });
    res.redirect('/');
})

// [Get] /Dashboard (대시보드 페이지)
app.get('/Dashboard', (req, res) => {
    /*  Login
    var ITF = parseInt(req.signedCookies.ITF);
    if (ITF != 1){
        res.redirect('/');
        return true;
    }
    */
    res.render('Dashboard');
})

// [Get] /EventLog (이벤트 로그 페이지)
app.get('/Eventlog', (req, res) => {
    res.render('Eventlog');
})

// [Get] /Users (유저 페이지)
app.get('/Users', (req, res) => {
    //User 테이블에 있는 정보를 조회 한다.
    var sql1 = 'select * from User';
    conn.query(sql1, function (err, userslist, fields) {
        res.render('Users',{
          userslist: userslist
    });
  });
});

// [Get] /Dashboard (유저 수정 페이지(추후 Usersettings/Usermanage로 소문자 변경 고려))
app.post('/Usersettings/:userno', (req, res) => {
    var User_Name = req.body.User_Name;
    var User_SMB = req.body.User_SMB;
    var User_Policy = req.body.User_Policy;
    var User_IP = req.body.User_IP;
    var userno = req.params.userno;
    // UserSettings 에서 변경된 정보를 SQL에 있는 정보를 업데이트 하는 SQL 쿼리문
    var sql1 = 'update User set User_Name=?, User_IP=?, User_SMB=?, User_Policy=? where User_No=?';
    conn.query(sql1, [User_Name, User_IP, User_SMB, User_Policy, userno], function (err, tmp, fields) {
            res.redirect('/Users');
        });
    });

//Users 로부터 Id 값을 주소 뒤편에 입력을 받아서 그 입력값을 이용하여 DB에 저장된 값을 검색한다.
app.get('/UserSettings/:userno', (req, res) => {
  //User_No 에 따라서 다르게 표시해준다.
  var userno = req.params.userno;
  //MySql 의 Users 테이블과 Policy 테이블의 데이터중 사용자번호와 설정된 정책 번호를 보여준다.
  var sql1 = 'select * from User, Policy where User_No = ? and User_Policy = Policy_No';
  //MySql 의 Policy 테이블의 데이터를 다 보여준다.
  var sql2 = 'select * from Policy';
  conn.query(sql1, [userno], function (err, usersettings, fields) {
      conn.query(sql2, [userno], function (err, policyname, fiedls) {
          res.render('Usersettings',{
              usersettings: usersettings,
              policyname: policyname
          });
      });
  });
});

// [Get] /Systempolicy (시스템 정책 페이지)
app.get('/Systempolicy', (req, res) => {
    // 시스템 정책의 리스트받아 올 정보
    var sql1 = 'select Policy_No, Policy_Name, Policy_Comment, Policy_Update from Policy';
    conn.query(sql1, function (err, syspolicy, fields) {
        res.render('Systempolicy', {
            syspolicy: syspolicy
        });
    });
})

// [Post] /Addsystempolicy (시스템 정책 추가)
app.post('/Addsystempolicy', (req, res) => {
    var Policy_Name = req.body.Policy_Name;
    var Policy_Comment = req.body.Policy_Comment;
    var Policy_Update = req.body.Policy_Update;
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
    if (Policy_Taskmgr == 1) {
        Policy_Mask += 1;
    }
    if (Policy_Regedit == 1) {
        Policy_Mask += 2;
    }
    if (Policy_Cmd == 1) {
        Policy_Mask += 4;
    }
    if (Policy_Snippingtools == 1) {
        Policy_Mask += 8;
    }
    if (Policy_Usbwrite == 1) {
        Policy_Mask += 16;
    }
    if (Policy_Usbaccess == 1) {
        Policy_Mask += 32;
    }
    if (Policy_Disk == 1) {
        Policy_Mask += 64;
    }
    if (Policy_Clipboard == 1) {
        Policy_Mask += 128;
    }
    // Insert System Policy
    var sql1 = 'insert into Policy (Policy_Name, Policy_Comment, Policy_Update, Policy_Mask, Policy_Taskmgr, Policy_Regedit, Policy_Cmd, Policy_Snippingtools, Policy_Usbwrite, Policy_Usbaccess, Policy_Disk, Policy_Clipboard) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    conn.query(sql1, [Policy_Name, Policy_Comment, Policy_Update, Policy_Mask, Policy_Taskmgr, Policy_Regedit, Policy_Cmd, Policy_Snippingtools, Policy_Usbwrite, Policy_Usbaccess, Policy_Disk, Policy_Clipboard], function (err, tmp, fields) {
        console.log(tmp);
    });

    res.redirect('/Systempolicy');
})

// [Post] /Deletesystempolicy (시스템 정책 삭제)
app.post('/Deletesystempolicy', (req, res) => {
    var id = req.body.policycheck;
    console.log(id);
    var sql1 = 'delete from Policy where Policy_No=?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items + "[policydeleted]");
            conn.query(sql1, [items], function (err, result) {});
        });
    } else {
        console.log(id + "[policydeleted]");
        conn.query(sql1, [id], function (err, result) {});
    }
    res.redirect('/Systempolicy');
});

// [Get] /Systempolicydetail (시스템 정책 세부 사항 페이지)
app.get('/Systempolicydetail/:policyno', (req, res) => {
    var policyno = req.params.policyno;
    // 시스템 정책 세부 정책 Policy_No를 이용해 구분하며 검색
    var sql1 = 'select * from Policy where Policy_No = ?';
    // 시스템 정책 사용자
    var sql2 = 'select * from User, Department, Positions where User_Policy = ? and User_Positions = Positions_No and User_Department = Department_No';
    conn.query(sql1, [policyno], function (err, syspolicy, fields) {
        conn.query(sql2, [policyno], function (err, policyuser, fields) {
            res.render('Systempolicydetail', {
                syspolicy: syspolicy,
                policyuser: policyuser
            });
        })
    });
})

// [Get] /Systempolicymanage (시스템 정책 사용자 설정 페이지)
app.get('/Systempolicymanage/:policyno', (req, res) => {
    var policyno = req.params.policyno;
    // 시스템 정책명
    var sql1 = 'select * from Policy where Policy_No = ?';
    // 이 정책이 적용되어 있지 않은 사용자
    var sql2 = 'select * from User, Department, Positions where (User_Policy != ? or ISNULL(User_Policy)) and User_Positions = Positions_No and User_Department = Department_No'
    // 이 정책이 적용되어 있는 사용자
    var sql3 = 'select * from User, Department, Positions where User_Policy = ? and User_Positions = Positions_No and User_Department = Department_No';
    conn.query(sql1, [policyno], function (err, syspolicy, fields) {
        conn.query(sql2, [policyno], function (err, userexport, fields) {
            conn.query(sql3, [policyno], function (err, userimport, fields) {
                res.render('Systempolicymanage', {
                    syspolicy: syspolicy,
                    userexport: userexport,
                    userimport: userimport
                });
            });
        });
    });
})

// [Post] /Systempolicyuserin (시스템 정책 사용자 추가)
app.post('/Systempolicyuserin/:policyno', (req, res) => {
    var policyno = req.params.policyno;
    var id = req.body.usercheck1;
    console.log(id);
    var sql1 = 'update User set User_Policy = ? where User_No = ?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items + "[Policychanged]");
            conn.query(sql1, [policyno, items], function (err, result) {});
        });
    } else {
        console.log(id + "[Policychanged]");
        conn.query(sql1, [policyno, id], function (err, result) {});
    }
    res.redirect('/Systempolicydetail/'+policyno);
});

// [Post] /Systempolicyuserout (시스템 정책 사용자 제외)
app.post('/Systempolicyuserout/:policyno', (req, res) => {
    var policyno = req.params.policyno;
    var id = req.body.usercheck2;
    console.log(id);
    var sql1 = 'update User set User_Policy = null where User_No = ?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items + "[Policychanged]");
            conn.query(sql1, [items], function (err, result) {});
        });
    } else {
        console.log(id + "[Policychanged]");
        conn.query(sql1, [id], function (err, result) {});
    }
    res.redirect('/Systempolicydetail/'+policyno);
});

// [Get] /Systempolicyedit (시스템 정책 수정 페이지)
app.get('/Systempolicyedit/:policyno', (req, res) => {
    var policyno = req.params.policyno;
    // 시스템 정책 수정 페이지 Policy_No를 이용해 구분하며 검색
    var sql1 = 'select * from Policy where Policy_No=?';
    conn.query(sql1, [policyno], function (err, syspolicy, fields) {
        res.render('Systempolicyedit', {
            syspolicy: syspolicy
        });
    });
})

// [Post] /Updatesystempolicy (시스템 정책 수정)
app.post('/Updatesystempolicy/:policyno', (req, res) => {
    // policyno = 시스템 정책 번호
    var policyno = req.params.policyno;
    var Policy_Name = req.body.Policy_Name;
    var Policy_Comment = req.body.Policy_Comment;
    var Policy_Update = req.body.Policy_Update;
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
    if (Policy_Taskmgr == 1) {
        Policy_Mask += 1;
    }
    if (Policy_Regedit == 1) {
        Policy_Mask += 2;
    }
    if (Policy_Cmd == 1) {
        Policy_Mask += 4;
    }
    if (Policy_Snippingtools == 1) {
        Policy_Mask += 8;
    }
    if (Policy_Usbwrite == 1) {
        Policy_Mask += 16;
    }
    if (Policy_Usbaccess == 1) {
        Policy_Mask += 32;
    }
    if (Policy_Disk == 1) {
        Policy_Mask += 64;
    }
    if (Policy_Clipboard == 1) {
        Policy_Mask += 128;
    }
    // System Policy Update sql
    var sql1 = 'update Policy set Policy_Name=?, Policy_Update=?, Policy_Comment=?, Policy_Mask=?, Policy_Taskmgr=?, Policy_Regedit=?, Policy_Cmd=?, Policy_Snippingtools=?, Policy_Usbwrite=?, Policy_Usbaccess=?, Policy_Disk=?, Policy_Clipboard=? where Policy_No=?';

    conn.query(sql1, [Policy_Name, Policy_Update, Policy_Comment, Policy_Mask, Policy_Taskmgr, Policy_Regedit, Policy_Cmd, Policy_Snippingtools, Policy_Usbwrite, Policy_Usbaccess, Policy_Disk, Policy_Clipboard, policyno], function (err, tmp, fields) {
        console.log(tmp);
    });

    res.redirect('/Systempolicy');
})

// [Get] /Folderpolicy (폴더 정책 페이지)
app.get('/Folderpolicy', (req, res) => {
    // 폴더 정책에 대한 데이터 베이스 정보 모두 가져오기
    var sql1 = 'select * from Folder';
    conn.query(sql1, function (err, dirpolicy, fields) {
        res.render('Folderpolicy', {
            dirpolicy: dirpolicy
        });
    });
});

// [Post] /Deletefolderpolicy (폴더 정책 삭제)
app.post('/Deletefolderpolicy', (req, res) => {
    var id = req.body.foldercheck;
    console.log(id);
    var sql1 = 'delete from Folder where Folder_No=?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items + "[folderdeleted]");
            conn.query(sql1, [items], function (err, result) {});
        });
    } else {
        console.log(id + "[folderdeleted]");
        conn.query(sql1, [id], function (err, result) {});
    }
    res.redirect('/Folderpolicy');
});

// [Get] /Folderpolicydetail (폴더 정책 세부 사항 페이지)
app.get('/Folderpolicydetail/:folderno', (req, res) => {
    // policyno = Folder_No
    var folderno = req.params.folderno;
    // 폴더 정책을 Folder_No을 이용하여 가져온다.
    var sql1 = 'select * from Folder where Folder_No=?';
    // 폴더 정책 사용자
    var sql2 = 'select * from User, Rule, Department, Positions where User_No = Rule_User and User_Positions = Positions_No and User_Department = Department_No and Rule_Folder = ?';
    conn.query(sql1, [folderno], function (err, dirpolicy, fields) {
        conn.query(sql2, [folderno], function (err, folderuser, fields) {
            res.render('Folderpolicydetail', {
                dirpolicy: dirpolicy,
                folderuser: folderuser
            });  
        })
    });
})

// [Get] /Folderpolicymanage (폴더 정책 사용자 설정 페이지)
app.get('/Folderpolicymanage/:folderno', (req, res) => {
    var folderno = req.params.folderno;
    // 시스템 정책명
    var sql1 = 'select * from Folder where Folder_No = ?';
    // 이 정책이 적용되어 있지 않은 사용자
    var sql2 = 'select * from User, Department, Positions where User_Positions = Positions_No and User_Department = Department_No and User_No NOT IN (select User_No from User, Rule where User_No = Rule_User and Rule_Folder = ?);';
    // 이 정책이 적용되어 있는 사용자
    var sql3 = 'select * from User, Rule, Department, Positions where User_No = Rule_User and User_Positions = Positions_No and User_Department = Department_No and Rule_Folder = ?';
    conn.query(sql1, [folderno], function (err, dirpolicy, fields) {
        conn.query(sql2, [folderno], function (err, userexport, fields) {
            conn.query(sql3, [folderno], function (err, userimport, fields) {
                res.render('Folderpolicymanage', {
                    dirpolicy: dirpolicy,
                    userexport: userexport,
                    userimport: userimport
                });
            });
        });
    });
})

// [Post] /Folderpolicyuserin (폴더 정책 사용자 추가)
app.post('/Folderpolicyuserin/:folderno', (req, res) => {
    var folderno = req.params.folderno;
    var id = req.body.usercheck1;
    console.log(id);
    var sql1 = 'insert into Rule(Rule_Folder, Rule_User) VALUES(?, ?)';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items + "[FolderPolicychanged]");
            conn.query(sql1, [folderno, items], function (err, result) {});
        });
    } else {
        console.log(id + "[FolderPolicychanged]");
        conn.query(sql1, [folderno, id], function (err, result) {});
    }
    res.redirect('/Folderpolicydetail/'+folderno);
});

// [Post] /Systempolicyuserout (폴더 정책 사용자 제외)
app.post('/Folderpolicyuserout/:folderno', (req, res) => {
    var folderno = req.params.folderno;
    var id = req.body.usercheck2;
    console.log(id);
    var sql1 = 'delete from Rule where Rule_Folder = ? and Rule_User = ?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items + "[FolderPolicychanged]");
            conn.query(sql1, [folderno, items], function (err, result) {});
        });
    } else {
        console.log(id + "[FolderPolicychanged]");
        conn.query(sql1, [id], function (err, result) {});
    }
    res.redirect('/Folderpolicydetail/'+folderno);
});

// [Get] /Folderpolicyedit (폴더 정책 수정 페이지)
app.get('/Folderpolicyedit/:folderno', (req, res) => {
    // policyno = Folder_No
    var folderno = req.params.folderno;
    // 폴더 정책을 Folder_No을 이용하여 가져온다.
    var sql1 = 'select * from Folder where Folder_No=?';
    conn.query(sql1, [folderno], function (err, dirpolicy, fields) {
        res.render('Folderpolicyedit', {
            dirpolicy: dirpolicy
        });
    });
})

// [Post] /Updatefolderpolicy (폴더 정책 수정)
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
    conn.query(sql1, [Folder_Name, Folder_Comment, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask, folderno], function (err, tmp, fields) {
        console.log(tmp);
    });

    res.redirect('/Folderpolicydetail/'+folderno);
})

// [Get] /Setting (설정)
app.get('/Setting', (req, res) => {
    res.render('Setting');
})

// [Get] / (로그인 페이지)
app.get('/', (req, res) => {
    res.render('Login');
})

// Error
app.get('*', function (req, res, next) {
    throw new Error();
});

// Error
app.use(function (error, req, res, next) {
    res.render('Error');
});

module.exports = app;
