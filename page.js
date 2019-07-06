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
// fast-csv
var csv = require('fast-csv');
// fs
var fs = require('fs');
// multer
var multer  = require('multer')
// upload
var upload = multer({ dest: 'uploads/' })     
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

// [Post] /Login (로그인)
app.post('/Login', (req, res) => {
    var id = req.body.ID;
    var password = req.body.Pass;
    res.cookie('ITF', 2, {
        signed: true
    });
    // [select] 인증 데이터
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

// [Get] /Logout (로그아웃)
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
    // [select] 사용자 인원, 시스템 정책 수, 폴더 정책 수
    var sql1 = 'select (SELECT COUNT(*) FROM User) Usern, (SELECT COUNT(*) FROM Policy) Policyn, (SELECT COUNT(*) FROM Folder) Foldern from DUAL';
    // [select] 시스템 정책
    var sql2 = 'select Policy_No, Policy_Name, Policy_Comment, (SELECT COUNT(*) FROM User where User_Policy = Policy_No) AS Policyn from Policy;';
    // [select] 폴더 정책
    var sql3 = 'select Folder_No, Folder_Name, Folder_Path, (SELECT COUNT(*) FROM Rule where Rule_Folder = Folder_No) AS Foldern from Folder;';
    conn.query(sql1, function (err, num, fields) {
        conn.query(sql2, function (err, policy, fields) {
            conn.query(sql3, function (err, folder, fields) {
                res.render('Dashboard', {
                    num: num,
                    policy, policy,
                    folder: folder
                });
            });
        })
    });
})

// [Get] /EventLog (이벤트 로그 페이지)
app.get('/Eventlog', (req, res) => {
    res.render('Eventlog');
})

// [Get] /Users (유저 페이지)
app.get('/Users', (req, res) => {
    // [select] 사용자 데이터
    var sql1 = 'select * from User left outer join Policy on User_Policy=Policy_No where User_Policy is null or User_Policy=Policy_No order by User_No;';
    // [select] 시스템 정책
    var sql2 = 'select * from Policy';
    // [select] 부서
    var sql3 = 'select * from Department';
    // [select] 직책
    var sql4 = 'select * from Positions';
    // [select] 폴더 정책
    var sql5 = 'select * from Folder';
    conn.query(sql1, function (err, userslist, fields) {
        conn.query(sql2, function (err, policy, fields) {
            conn.query(sql3, function (err, department, fields) {
                conn.query(sql4, function (err, positions, fields) {
                    conn.query(sql5, function (err, folder, fields) {
                        res.render('Users', {
                            userslist: userslist,
                            policy: policy,
                            department: department,
                            positions: positions,
                            folder: folder
                        });
                    });
                });
            }); 
        });
    });
});

// [Post] /Adduser (유저추가)
app.post('/Adduser', (req, res) => {
    var User_Name = req.body.User_Name;
    var User_SMB = req.body.User_SMB;
    var User_IP = req.body.User_IP;
    var User_Department = req.body.User_Department;
    var User_Positions = req.body.User_Positions;
    var User_Policy = req.body.User_Policy;
    var foldercheck = req.body.foldercheck;
    // [insert] 사용자 추가
    var sql1 = 'insert into User (User_Name, User_SMB, User_IP, User_Department, User_Positions, User_Policy) values (?, ?, ?, ?, ?, ?)';
    // [select] 위에서 생성된 사용자 확인
    var sql2 = 'select * from User where User_SMB = ?'
    // [insert] 폴더정책 추가
    var sql3 = 'insert into Rule(Rule_Folder, Rule_User) VALUES(?, ?)';
    conn.query(sql1, [User_Name, User_SMB, User_IP, User_Department, User_Positions, User_Policy], function(err, tmp, result){
        conn.query(sql2, [User_SMB], function(err, tmp2, result){
            if (Array.isArray(foldercheck) == true) {
                foldercheck.forEach(function (items) {
                    console.log(items + "[FolderPolicy]");
                    conn.query(sql3, [items, tmp2[0].User_No], function (err, result) {});
                });
            } else {
                console.log(id + "[FolderPolicychanged]");
                conn.query(sql3, [foldercheck, tmp2[0].User_No], function (err, result) {});
            }
        })
    })
    res.redirect('/Users');
});

// [Post] /Addusercsv (유저추가CSV)
app.post('/Addusercsv', upload.single('avatar'), (req, res, next) => {
    console.log(req.file.filename);
    var filename = req.file.filename;
    var sql1 = 'insert into User (User_Name, User_SMB, User_IP, User_Department, User_Positions, User_Policy) values (?, ?, ?, ?, ?, ?)';
    var read = fs.createReadStream('C:/ITF/uploads/' + filename)
    .pipe(csv())
    .on('data', function(data) {
        console.log(data);
        conn.query(sql1, [data[0], data[1], data[2], data[3], data[4], data[5]], function (err, tmp, result){
            console.log(tmp);
        })
    })
    .on('end', function(data){
        console.log('Read finished');
    })
    res.redirect('/Users');
});

//[Post] /Deleteuser (유저삭제)
app.post('/Deleteuser', (req, res) => {
    var id = req.body.usercheck;
    console.log(id);
    // [delete] 사용자 삭제
    var sql1 = 'delete from User where User_No=?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items + "[usersdeleted]");
            conn.query(sql1, [items], function (err, result) {});
        });
    } else {
        console.log(id + "[usersdeleted]");
        conn.query(sql1, [id], function (err, result) {});
    }
    res.redirect('/Users');
});

// [Get] /Userdetail (유저 자세히 보기 페이지)
app.get('/Userdetail/:userno', (req, res) => {
    var userno = req.params.userno;
    // [select] 단일 사용자의 데이터
    var sql1 = 'select * from Department, Positions, User left outer join Policy on User_Policy=Policy_No where User_Positions = Positions_No and User_Department = Department_No and User_No = ?';
    // [select] 사용자가 소속된 폴더 정책
    var sql2 = 'select * from User, Rule, Folder where User_No = Rule_User and Folder_No = Rule_Folder and User_No = ?';
    conn.query(sql1, [userno], function (err, userdetail, fields) {
        conn.query(sql2, [userno], function (err, userfolder, fields) {
            res.render('Userdetail', {
                userdetail: userdetail,
                userfolder: userfolder
            })
        })
    })
})

// [Get] /Useredit (유저 수정 페이지)
app.get('/Useredit/:userno', (req, res) => {
    var userno = req.params.userno;
    // [select] 단일 사용자의 데이터와 사용자의 시스템 정책
    var sql1 = 'select * from Department, Positions, User left outer join Policy on User_Policy=Policy_No where User_Positions = Positions_No and User_Department = Department_No and User_No = ?';
    // [select] 시스템 정책
    var sql2 = 'select * from Policy';
    // [select] 부서
    var sql3 = 'select * from Department';
    // [select] 직책
    var sql4 = 'select * from Positions';

    conn.query(sql1, [userno], function (err, usersettings, fields) {
        conn.query(sql2, function (err, policy, fields) {
            conn.query(sql3, function (err, department, fields) {
                conn.query(sql4, function (err, positions, fields) {
                    res.render('Useredit', {
                        usersettings: usersettings,
                        policy: policy,
                        department: department,
                        positions: positions
                    });
                });
            }); 
        });
    });
});

// [Post] /Updateuser (유저 수정)
app.post('/Updateuser/:userno', (req, res) => {
    var User_Name = req.body.User_Name;
    var User_SMB = req.body.User_SMB;
    var User_Policy = req.body.User_Policy;
    var User_IP = req.body.User_IP;
    var User_Department = req.body.User_Department;
    var User_Positions = req.body.User_Positions;
    var User_Policy = req.body.User_Policy;
    var userno = req.params.userno;
    // [update] 사용자 데이터 수정
    var sql1 = 'update User set User_Name=?, User_IP=?, User_SMB=?, User_Policy=?, User_Department=?, User_Positions=?, User_Policy=? where User_No=?';
    conn.query(sql1, [User_Name, User_IP, User_SMB, User_Policy, User_Department, User_Positions, User_Policy, userno], function (err, tmp, fields) {
        res.redirect('/Users');
    });
});

// [Get] /Systempolicy (시스템 정책 페이지)
app.get('/Systempolicy', (req, res) => {
    // [select] 시스템 정책
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
    // [insert] 시스템 정책 추가
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
    // [delete] 시스템 정책 삭제
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
    // [select] 단일 시스템 정책
    var sql1 = 'select * from Policy where Policy_No = ?';
    // [select] 해당 시스템 정책을 적용한 사용자 검색
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
    // [select] 시스템 정책 데이터 (정책명 사용위함)
    var sql1 = 'select * from Policy where Policy_No = ?';
    // [select] 해당 정책이 적용되어 있지 않은 사용자
    var sql2 = 'select * from User, Department, Positions where (User_Policy != ? or ISNULL(User_Policy)) and User_Positions = Positions_No and User_Department = Department_No'
    // [select] 해당 정책이 적용되어 있는 사용자
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
    // [update] 사용자 시스템 정책 적용
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
    res.redirect('/Systempolicydetail/' + policyno);
});

// [Post] /Systempolicyuserout (시스템 정책 사용자 제외)
app.post('/Systempolicyuserout/:policyno', (req, res) => {
    var policyno = req.params.policyno;
    var id = req.body.usercheck2;
    console.log(id);
    // [update] 사용자 시스템 정책 적용 해제
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
    res.redirect('/Systempolicydetail/' + policyno);
});

// [Get] /Systempolicyedit (시스템 정책 수정 페이지)
app.get('/Systempolicyedit/:policyno', (req, res) => {
    var policyno = req.params.policyno;
    // [select] 시스템 정책 데이터
    var sql1 = 'select * from Policy where Policy_No=?';
    conn.query(sql1, [policyno], function (err, syspolicy, fields) {
        res.render('Systempolicyedit', {
            syspolicy: syspolicy
        });
    });
})

// [Post] /Updatesystempolicy (시스템 정책 수정)
app.post('/Updatesystempolicy/:policyno', (req, res) => {
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
    
    // [update] 시스템 정책 수정
    var sql1 = 'update Policy set Policy_Name=?, Policy_Update=?, Policy_Comment=?, Policy_Mask=?, Policy_Taskmgr=?, Policy_Regedit=?, Policy_Cmd=?, Policy_Snippingtools=?, Policy_Usbwrite=?, Policy_Usbaccess=?, Policy_Disk=?, Policy_Clipboard=? where Policy_No=?';

    conn.query(sql1, [Policy_Name, Policy_Update, Policy_Comment, Policy_Mask, Policy_Taskmgr, Policy_Regedit, Policy_Cmd, Policy_Snippingtools, Policy_Usbwrite, Policy_Usbaccess, Policy_Disk, Policy_Clipboard, policyno], function (err, tmp, fields) {
        console.log(tmp);
    });

    res.redirect('/Systempolicy');
})

// [Get] /Folderpolicy (폴더 정책 페이지)
app.get('/Folderpolicy', (req, res) => {
    // [select] 폴더 정책
    var sql1 = 'select * from Folder';
    conn.query(sql1, function (err, dirpolicy, fields) {
        res.render('Folderpolicy', {
            dirpolicy: dirpolicy
        });
    });
});

// [Post] /Addfolderpolicy (폴더 정책 추가)
app.post('/Addfolderpolicy', (req, res) => {
    var Folder_Name = req.body.Folder_Name;
    var Folder_Path = req.body.Folder_Path;
    var Folder_Comment = req.body.Folder_Comment;
    var Folder_Update = req.body.Folder_Update;
    var Folder_Readonly = req.body.Folder_Readonly;
    var Folder_Writeable = req.body.Folder_Writeable;
    var Folder_Guest = req.body.Folder_Guest;
    var Folder_Browsable = req.body.Folder_Browsable;
    var Folder_Createmask = req.body.Folder_Createmask;
    var Folder_Directorymask = req.body.Folder_Directorymask;

    // [insert] 폴더 정책 추가
    var sql1 = 'insert into Folder (Folder_Name, Folder_Path, Folder_Comment, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    conn.query(sql1, [Folder_Name, Folder_Path, Folder_Comment, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask], function (err, tmp, fields) {
        console.log(tmp);
    });
    res.redirect('/Folderpolicy');
});

// [Post] /Deletefolderpolicy (폴더 정책 삭제)
app.post('/Deletefolderpolicy', (req, res) => {
    var id = req.body.foldercheck;
    console.log(id);
    // [delete] 폴더 정책 삭제
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
    var folderno = req.params.folderno;
    // [select] 폴더 정책 데이터
    var sql1 = 'select * from Folder where Folder_No=?';
    // [select] 해당 폴더 정책을 적용한 사용자 검색
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
    // [select] 폴더 정책 데이터 (정책명 사용위함)
    var sql1 = 'select * from Folder where Folder_No = ?';
    // [select] 해당 정책이 적용되어 있지 않은 사용자
    var sql2 = 'select * from User, Department, Positions where User_Positions = Positions_No and User_Department = Department_No and User_No NOT IN (select User_No from User, Rule where User_No = Rule_User and Rule_Folder = ?);';
    // [select] 해당 정책이 적용되어 있는 사용자
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
    // [insert] 폴더 정책 사용자 추가
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
    res.redirect('/Folderpolicydetail/' + folderno);
});

// [Post] /Systempolicyuserout (폴더 정책 사용자 제외)
app.post('/Folderpolicyuserout/:folderno', (req, res) => {
    var folderno = req.params.folderno;
    var id = req.body.usercheck2;
    console.log(id);
    // [delete] 폴더 정책 사용자 제외
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
    res.redirect('/Folderpolicydetail/' + folderno);
});

// [Get] /Folderpolicyedit (폴더 정책 수정 페이지)
app.get('/Folderpolicyedit/:folderno', (req, res) => {
    // policyno = Folder_No
    var folderno = req.params.folderno;
    // [select] 폴더 정책 데이터
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

    // [update] 폴더 정책 수정
    var sql1 = 'update Folder set Folder_Name=?, Folder_Comment=?, Folder_Update=?, Folder_Readonly=?, Folder_Writeable=?, Folder_Guest=?, Folder_Browsable=?, Folder_Createmask=?, Folder_Directorymask=? where Folder_No=?';
    conn.query(sql1, [Folder_Name, Folder_Comment, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask, folderno], function (err, tmp, fields) {
        console.log(tmp);
    });

    res.redirect('/Folderpolicydetail/' + folderno);
})

// [Get] /Setting (설정)
app.get('/Setting', (req, res) => {
    res.render('Setting');
})

// [Get] / (로그인 페이지)
app.get('/', (req, res) => {
    res.render('Login');
})

// [Get] Error (에러)
app.get('*', function (req, res, next) {
    throw new Error();
});

// [Get] Error page (에러 페이지)
app.use(function (error, req, res, next) {
    res.render('Error');
});

module.exports = app;
