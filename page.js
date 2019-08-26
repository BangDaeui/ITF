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
// exec
const exec = require('child_process').execSync;
// async
const async = require('async');
// cookie-parser
const cookie = require('cookie-parser');
// fast-csv
const csv = require('fast-csv');
// fs
const fs = require('fs');
// os
const os = require('os');
// multer
const multer  = require('multer');
// upload
const upload = multer({ dest: 'uploads/' })  
// random string
const randomstring = require("randomstring");
// check disk space
const checkDiskSpace = require('check-disk-space')
// get folder size
const getSize = require('get-folder-size');
// sql connection
const conn = mysql.createConnection({
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

// disk free
var free = 0;
// disk size
var size = 0;

// checking disk usage interval 300 seconds
DiskCheck();
setInterval(function () { 
    DiskCheck(); 
}, 300000);

function DiskCheck() {
    console.log("Disk Checking");
    if (os.type() == 'Windows_NT')
    {
        checkDiskSpace('C:/').then((diskSpace) => {
            free = Math.round((diskSpace.free / 1024 / 1024 / 1024 * 100)) / 100;
            size = Math.round((diskSpace.size / 1024 / 1024 / 1024 * 100)) / 100;
            console.log(diskSpace);
        });
    } else {
        checkDiskSpace('/').then((diskSpace) => {
            free = Math.round((diskSpace.free / 1024 / 1024 / 1024 * 100)) / 100;
            size = Math.round((diskSpace.size / 1024 / 1024 / 1024 * 100)) / 100;
            console.log(diskSpace);
        });
    }
}

function SettingSamba() {
    if (os.type() == 'Windows_NT')
        return;
    
    exec("cat smb.txt > /etc/samba/smb.conf", function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
            
            
        }
    });

    var sql1 = 'select * from Folder;';
    var sql2 = 'select * from Rule, User where Rule_User = User_No and Rule_Folder = ?;';
    conn.query(sql1, async function (err, result, fields) {
        console.log(result.length);
        for (var i = 0; i < result.length; i++){
            await async.series([
                function(callback){
                    console.log('2' + i);
                    renum = result[i].Folder_No;
                    exec("echo -e \"\n[" + result[i].Folder_Name + "]\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    exec("echo -e \"\tcomment = " + result[i].Folder_Comment + "\" >> /etc/samba/smb.conf", function (error, stdout, stderr) {});
                    exec("echo -e \"\tpath = " + result[i].Folder_Path + "\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    exec("echo -e \"\tpublic = yes\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    if (result[i].Folder_Writeable) {
                        exec("echo -e \"\twritable = yes\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    }
                    else {
                        exec("echo -e \"\twritable = no\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    }
                    if (result[i].Folder_Browsable) {
                        exec("echo -e \"\tbrowseable = yes\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    }
                    else {
                        exec("echo -e \"\tbrowseable = no\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    }

                    exec("echo -e \"\tcreate mask = " + result[i].Folder_Createmask + "\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    exec("echo -e \"\tdirectory mask = " + result[i].Folder_Directorymask + "\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    exec("printf \"\tvalid users = \" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    callback(null);
                }, 

                function(callback){
                    conn.query(sql2, [renum], function (err, user, fields) {
                        for (var j = 0; j < user.length; j++) {
                            console.log(j);
                            if (j == user.length - 1){
                                exec("printf \"" + user[j].User_SMB + "\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                                callback(null);
                            }
                            else {
                                exec("printf \"" + user[j].User_SMB + ",\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                            }
                        }
                    })                   
                },

                function(callback){
                    console.log('done');
                    exec("printf \"\n\" >> /etc/samba/smb.conf > /dev/null 2>&1", function (error, stdout, stderr) {});
                    callback(null);
                }
            ])

        }
        exec("sudo service smb restart > /dev/null 2>&1", function (error, stdout, stderr) {});
    });
}

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
        if(!WebAuth[0]){
            res.send('<script type="text/javascript">alert("아이디 비밀번호를 틀렸습니다.");document.location.href="/";</script>');
        } else{
            if (password == WebAuth[0].WebAuth_Pass) {
                res.cookie('ITF', WebAuth[0].WebAuth_No, {
                    signed: true
                });
                res.redirect('/Dashboard');
            } else {
                res.send('<script type="text/javascript">alert("아이디 비밀번호를 틀렸습니다.");document.location.href="/";</script>');
            }
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
    // [select] 유저 로그
    var sql4 = 'select count(*) AS "Userlog_All" ,count(case when Userlog_State = 1 Then 1 END) AS "Userlog_Login", count(case when Userlog_State = 2 Then 2 END) AS "Userlog_Logout", count(case when Userlog_State = 3 Then 3 END) AS "Userlog_Change" from UserLog';
    // [select] 파일 로그
    var sql5 = 'select count(*) AS "Filelog_All" ,count(case when Filelog_State = 1 Then 1 END) AS "Filelog_Execute", count(case when Filelog_State = 2 Then 1 END) AS "Filelog_Create", count(case when Filelog_State = 3 Then 1 END) AS "Filelog_Modify", count(case when Filelog_State = 4 Then 1 END) AS "Filelog_Delete", count(case when Filelog_State = 5 Then 1 END) AS "Filelog_Rename" from FileLog';
    console.log(free);
    console.log(size);
    var hostname = os.hostname();
    var cpu = os.cpus()[0].model;
    var memory = (os.totalmem() / 1000 / 1000 / 1000).toFixed(2) + "GB";
    var osname = os.type();
    var ips = "";
    if (os.type() == 'Linux')
        ips = os.networkInterfaces()['eth0'][0].address;
    else
        ips = "127.0.0.1";
    
    conn.query(sql1, function (err, num, fields) {
        conn.query(sql2, function (err, policy, fields) {
            conn.query(sql3, function (err, folder, fields) {
                conn.query(sql4, function (err, userlogc, fields) {
                    conn.query(sql5, function (err, filelogc, fiedls) {
                        res.render('Dashboard', {
                            num: num,
                            policy: policy,
                            folder: folder,
                            free: free,
                            size: size,
                            userlogc: userlogc,
                            filelogc: filelogc,
                            hostname: hostname,
                            cpu: cpu,
                            memory: memory,
                            osname: osname,
                            ips: ips
                        });
                    })
                })
            });
        })
    });
})

// [Get] /EventLog (이벤트 로그 페이지)
app.get('/Eventlog', (req, res) => {
    // [select] Filelog
    var sql1 = 'select Filelog_No, Filelog_Name, Filelog_Path, Filelog_IP, DATE_FORMAT(Filelog_Time, "%a %b %d %Y %H:%i:%s") AS "Filelog_Time", case Filelog_State when 1 then "파일 실행" when 2 then "파일 생성" when 3 then "파일 수정" when 4 then "파일 삭제" when 5 then "파일 이름 변경" END AS "Filelog_State" from FileLog;'
    // [select] Userlog
    var sql2 = 'select Userlog_No, Userlog_Name, Userlog_MAC, Userlog_IP, DATE_FORMAT(Userlog_Time, "%a %b %d %Y %H:%i:%s") AS "Userlog_Time", case Userlog_State when 1 then "로그인" when 2 then "로그아웃" when 3 then "비밀번호 변경" END AS "Userlog_State" from UserLog;'
    conn.query(sql1, function (err, Filelog, fields) {
        conn.query(sql2, function (err, Userlog, fields) {
            res.render('Eventlog', {
                Filelog: Filelog,
                Userlog: Userlog
            });
        });
    });
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
    var sql1 = 'insert into User (User_Name, User_SMB, User_IP, User_Department, User_Positions, User_Policy, User_Key) values (?, ?, ?, ?, ?, ?, ?)';
    // [select] 위에서 생성된 사용자 확인
    var sql2 = 'select * from User where User_SMB = ?'
    // [insert] 폴더정책 추가
    var sql3 = 'insert into Rule(Rule_Folder, Rule_User) VALUES(?, ?)';
    // [insert] 인증 추가
    var sql4 = 'insert into Auth(Auth_No, Auth_ID, Auth_Pass) VALUES(?, ?, ?)';
    var rs = randomstring.generate(32);
    conn.query(sql1, [User_Name, User_SMB, User_IP, User_Department, User_Positions, User_Policy, rs], function(err, tmp, result){
        conn.query(sql2, [User_SMB], function(err, tmp2, result){
            conn.query(sql4, [tmp2[0].User_No, User_SMB, 'kit2019'], function(error, result){});
            // Windows에서 실행하면 오류남
            if (os.type() == 'Windows_NT')
                return;
            if (!foldercheck) {
                exec("sudo useradd " + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                exec("echo 'kit2019' | sudo passwd --stdin " + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                exec("echo -e 'kit2019\nkit2019\n' | sudo smbpasswd -s -a " + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                exec("sudo chmod 755 /home/" + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
            }
            else if (Array.isArray(foldercheck) == true) {
                foldercheck.forEach(function (items) {
                    console.log(items + "[FolderPolicy]");
                    conn.query(sql3, [items, tmp2[0].User_No], function (err, result) {
                        exec("sudo useradd " + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                        exec("echo 'kit2019' | sudo passwd --stdin " + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                        exec("echo -e 'kit2019\nkit2019\n' | sudo smbpasswd -s -a " + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                        exec("sudo chmod 755 /home/" + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                        SettingSamba();
                    });
                });
            } else {
                conn.query(sql3, [foldercheck, tmp2[0].User_No], function (err, result) {
                    exec("sudo useradd " + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                    exec("echo 'kit2019' | sudo passwd --stdin " + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                    exec("echo -e 'kit2019\nkit2019\n' | sudo smbpasswd -s -a " + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                    exec("sudo chmod 755 /home/" + User_SMB + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                    SettingSamba();
                });
            }
        })
    })

    
    res.redirect('/Users');
});

// [Post] /Addusercsv (유저추가CSV)
app.post('/Addusercsv', upload.single('avatar'), (req, res, next) => {
    console.log(req.file.filename);
    var csvData = [];
    var filename = req.file.filename;
    var read = fs.createReadStream('uploads/' + filename)
        .pipe(csv.parse())
        .on('data', function(data) {
            csvData.push(data);
        })
        .on('end', function(data){
            console.log('Read finished');
            //csvData.shift();
            console.log(csvData);
            var sql1 = 'insert into User (User_Name, User_SMB, User_IP, User_Department, User_Positions, User_Policy) values ?';
            conn.query(sql1, [csvData], function (err, tmp, result){
                if (os.type() == 'Windows_NT')
                return;
                if(Array.isArray(csvData) == true) {
                    csvData.forEach(function(items){
                        console.log(items[1] + "[csvData]");
                        exec("sudo useradd " + items[1] + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                        exec("echo 'kit2019' | sudo passwd --stdin " + items[1] + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                        exec("echo -e 'kit2019\nkit2019\n' | sudo smbpasswd -s -a " + items[1] + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                    })
                } else {
                    console.log(csvData[1]);
                    exec("sudo useradd " + csvData[1] + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                    exec("echo 'kit2019' | sudo passwd --stdin " + csvData[1] + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                    exec("echo -e 'kit2019\nkit2019\n' | sudo smbpasswd -s -a " + csvData[1] + " > /dev/null 2>&1", function (error, stdout, stderr) {});
                }
                console.log(tmp);
            })
        });
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
    // [select] 유저 로그 수
    var sql3 = 'select count(case when Userlog_State = 1 Then 1 END) AS "Userlog_Login", count(case when Userlog_State = 2 Then 2 END) AS "Userlog_Logout", count(case when Userlog_State = 3 Then 3 END) AS "Userlog_Change" from UserLog where UserLog_Name = ?';
    // [select] 파일 로그 수
    var sql4 = 'select count(case when Filelog_State = 1 Then 1 END) AS "Filelog_Execute", count(case when Filelog_State = 2 Then 1 END) AS "Filelog_Create", count(case when Filelog_State = 3 Then 1 END) AS "Filelog_Modify", count(case when Filelog_State = 4 Then 1 END) AS "Filelog_Delete", count(case when Filelog_State = 5 Then 1 END) AS "Filelog_Rename" from FileLog where Filelog_Name = ?';
    // [select] 유저 로그
    var sql5 = 'select Userlog_No, Userlog_Name, Userlog_MAC, Userlog_IP, DATE_FORMAT(Userlog_Time, "%a %b %d %Y %H:%i:%s") AS "Userlog_Time", case Userlog_State when 1 then "로그인" when 2 then "로그아웃" when 3 then "비밀번호 변경" END AS "Userlog_State" from UserLog where Userlog_Name = ?';
    // [select] 파일 로그
    var sql6 = 'select Filelog_No, Filelog_Name, Filelog_Path, Filelog_IP, DATE_FORMAT(Filelog_Time, "%a %b %d %Y %H:%i:%s") AS "Filelog_Time", case Filelog_State when 1 then "파일 실행" when 2 then "파일 생성" when 3 then "파일 수정" when 4 then "파일 삭제" when 5 then "파일 이름 변경" END AS "Filelog_State" from FileLog where Filelog_Name = ?';
    
    conn.query(sql1, [userno], function (err, userdetail, fields) {
        var foldersize = '0 Byte';
        if (os.type() == 'Linux') {
            getSize('/home/' + userdetail[0].User_SMB, (err, size) => {
                if (err) { throw err; }
                if (size > 1000000) {
                    console.log((size / 1000 / 1000).toFixed(2) + ' MB');
                    foldersize = ((size / 1000 / 1000).toFixed(2) + ' MB');
                } else if (size > 1000) {
                    console.log((size / 1000).toFixed(2) + ' KB');
                    foldersize = ((size / 1000).toFixed(2) + ' KB');
                } else {                 
                    console.log((size).toFixed(2) + ' Byte');
                    foldersize = ((size).toFixed(2) + ' Byte');
                }
                conn.query(sql2, [userno], function (err, userfolder, fields) {
                    conn.query(sql3, [userdetail[0].User_SMB], function (err, userlogc, fields) {
                        conn.query(sql4, [userdetail[0].User_SMB], function (err, filelogc, fields) {
                            conn.query(sql5, [userdetail[0].User_SMB], function (err, userlog, fields) {
                                conn.query(sql6, [userdetail[0].User_SMB], function (err, filelog, fields) {
                                    res.render('Userdetail', {
                                        userdetail: userdetail,
                                        userfolder: userfolder,
                                        foldersize: foldersize,
                                        userlogc: userlogc,
                                        filelogc: filelogc,
                                        userlog: userlog,
                                        filelog: filelog
                                    })
                                })
                            })
                        })
                    })
                })
            });
        } else {
            conn.query(sql2, [userno], function (err, userfolder, fields) {
                conn.query(sql3, [userdetail[0].User_SMB], function (err, userlogc, fields) {
                    conn.query(sql4, [userdetail[0].User_SMB], function (err, filelogc, fields) {
                        conn.query(sql5, [userdetail[0].User_SMB], function (err, userlog, fields) {
                            conn.query(sql6, [userdetail[0].User_SMB], function (err, filelog, fields) {
                                res.render('Userdetail', {
                                    userdetail: userdetail,
                                    userfolder: userfolder,
                                    foldersize: foldersize,
                                    userlogc: userlogc,
                                    filelogc: filelogc,
                                    userlog: userlog,
                                    filelog: filelog
                                })
                            })
                        })
                    })
                })
            })
        }
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
    console.log(Policy_Taskmgr);
    // System Policy Mask Calculation
    if (Policy_Taskmgr == 1) {
        Policy_Mask += 1;
    } else{
        Policy_Taskmgr = 0;
    }
    if (Policy_Regedit == 1) {
        Policy_Mask += 2;
    } else{
        Policy_Regedit = 0;
    }
    if (Policy_Cmd == 1) {
        Policy_Mask += 4;
    } else{
        Policy_Cmd = 0;
    }
    if (Policy_Snippingtools == 1) {
        Policy_Mask += 8;
    } else{
        Policy_Snippingtools = 0;
    }
    if (Policy_Usbwrite == 1) {
        Policy_Mask += 16;
    } else{
        Policy_Usbwrite = 0;
    }
    if (Policy_Usbaccess == 1) {
        Policy_Mask += 32;
    } else{
        Policy_Usbaccess = 0;
    }
    if (Policy_Disk == 1) {
        Policy_Mask += 64;
    } else{
        Policy_Disk = 0;
    }
    if (Policy_Clipboard == 1) {
        Policy_Mask += 128;
    } else{
        Policy_Clipboard = 0;
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

    res.redirect('/Systempolicydetail/' + policyno);
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
    var rs = randomstring.generate(32);

    if(typeof Folder_Readonly == "undefined"){
        Folder_Readonly = 0;
    }
    if(typeof Folder_Writeable == "undefined"){
        Folder_Writeable = 0;
    }
    if(typeof Folder_Guest == "undefined"){
        Folder_Guest = 0;
    }
    if(typeof Folder_Browsable == "undefined"){
        Folder_Browsable = 0;
    }
    // [insert] 폴더 정책 추가
    var sql1 = 'insert into Folder (Folder_Name, Folder_Path, Folder_Comment, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask, Folder_Key) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
    conn.query(sql1, [Folder_Name, Folder_Path, Folder_Comment, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask, rs], function (err, tmp, fields) {
        console.log(tmp);
    });
    if (os.type() == 'Linux') {
        exec("sudo mkdir " + Folder_Path + " > /dev/null 2>&1", function (error, stdout, stderr) {});
    }
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
    SettingSamba();
    res.redirect('/Folderpolicy');
});

// [Get] /Folderpolicydetail (폴더 정책 세부 사항 페이지)
app.get('/Folderpolicydetail/:folderno', (req, res) => {
    var folderno = req.params.folderno;
    // [select] 폴더 정책 데이터
    var sql1 = 'select case (Folder_Createmask) when "0777" then "모든 사용자 모든 권한 허용" when "0755" then "소유자 모든 권한 다른 모든 사용자 읽기 실행권한 허용" when "0750" then "소유자 모든 권한 같은 그룹 사용자 읽기 실행권한 허용" when "0700" then "소유자 모든 권한 허용" when "0000" then "모든 사용자 권한 없음" end AS "Create", case (Folder_Directorymask) when "0777" then "모든 사용자 모든 권한 허용" when "0755" then "소유자 모든 권한 다른 모든 사용자 읽기 실행권한 허용" when "0750" then "소유자 모든 권한 같은 그룹 사용자 읽기 실행권한 허용" when "0700" then "소유자 모든 권한 허용" when "0000" then "모든 사용자 권한 없음" end AS "Directory", Folder_No, Folder_Name, Folder_Comment, Folder_Path, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask, Folder_Key from Folder where Folder_No=?';
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
    SettingSamba();
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
        conn.query(sql1, [folderno, id], function (err, result) {});
    }
    SettingSamba();
    res.redirect('/Folderpolicydetail/' + folderno);
});

// [Get] /Folderpolicyedit (폴더 정책 수정 페이지)
app.get('/Folderpolicyedit/:folderno', (req, res) => {
    // policyno = Folder_No
    var folderno = req.params.folderno;
    // [select] 폴더 정책 데이터
    var sql1 = 'select case (Folder_Createmask) when "0777" then "모든 사용자 모든 권한 허용" when "0755" then "소유자 모든 권한 다른 모든 사용자 읽기 실행권한 허용" when "0750" then "소유자 모든 권한 같은 그룹 사용자 읽기 실행권한 허용" when "0700" then "소유자 모든 권한 허용" when "0000" then "모든 사용자 권한 없음" end AS "Create", case (Folder_Directorymask) when "0777" then "모든 사용자 모든 권한 허용" when "0755" then "소유자 모든 권한 다른 모든 사용자 읽기 실행권한 허용" when "0750" then "소유자 모든 권한 같은 그룹 사용자 읽기 실행권한 허용" when "0700" then "소유자 모든 권한 허용" when "0000" then "모든 사용자 권한 없음" end AS "Directory", Folder_No, Folder_Name, Folder_Comment, Folder_Path, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask, Folder_Key from Folder where Folder_No=?';
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
    var Folder_Path = req.body.Folder_Path;
    var Folder_Comment = req.body.Folder_Comment;
    var Folder_Update = req.body.Folder_Update;
    var Folder_Readonly = req.body.Folder_Readonly;
    var Folder_Writeable = req.body.Folder_Writeable;
    var Folder_Guest = req.body.Folder_Guest;
    var Folder_Browsable = req.body.Folder_Browsable;
    var Folder_Createmask = req.body.Folder_Createmask;
    var Folder_Directorymask = req.body.Folder_Directorymask;

    if(typeof Folder_Readonly == "undefined"){
        Folder_Readonly = 0;
    }
    if(typeof Folder_Writeable == "undefined"){
        Folder_Writeable = 0;
    }
    if(typeof Folder_Guest == "undefined"){
        Folder_Guest = 0;
    }
    if(typeof Folder_Browsable == "undefined"){
        Folder_Browsable = 0;
    }
    
    // [select] 폴더 검색
    var sql1 = 'select * from Folder where Folder_No = ?';
    // [update] 폴더 정책 수정
    var sql2 = 'update Folder set Folder_Name=?, Folder_Comment=?, Folder_Path=?, Folder_Update=?, Folder_Readonly=?, Folder_Writeable=?, Folder_Guest=?, Folder_Browsable=?, Folder_Createmask=?, Folder_Directorymask=? where Folder_No=?';
    conn.query(sql1, [folderno], function (err, folder, fields) {
        if (os.type() == 'Linux')
            exec("sudo mv " + folder[0].Folder_Path + " " + Folder_Path + " > /dev/null 2>&1", function (error, stdout, stderr) {});
        conn.query(sql2, [Folder_Name, Folder_Comment, Folder_Path, Folder_Update, Folder_Readonly, Folder_Writeable, Folder_Guest, Folder_Browsable, Folder_Createmask, Folder_Directorymask, folderno], function (err, tmp, fields) {
            console.log(tmp);
            SettingSamba();
        });
    })
    res.redirect('/Folderpolicydetail/' + folderno);
})

// [Get] /Setting (설정)
app.get('/Setting', (req, res) => {
  var sql1 = 'select * from Department';
  var sql2 = 'select * from Positions';
  conn.query(sql1, function (err,departmentlist,fields) {
    conn.query(sql2, function (err,positionslist,fields) {
      res.render('Setting', {
          departmentlist: departmentlist,
          positionslist: positionslist
        });
      });
    });
})

//[Post] /Setting (설정)
app.post('/Setting',(req, res) => {
  res.render('Setting');
})

//[Post] /ChangePassmodal (비밀번호 변경)
app.post('/ChangePassmodal', (req, res) => {
  var password = req.body.WebAuth_Pass;
  var passwordchange = req.body.WebAuth_Passchange;
  var Auth = parseInt(req.signedCookies.ITF)
  // [select] 인증 데이터
  var sql1 = 'select WebAuth_Pass from WebAuth where WebAuth_No = ?';
  //[update] password 변경 데이터
  var sql2 = 'update WebAuth set WebAuth_Pass = ? ';
  conn.query(sql1, [Auth], function (err, WebAuth, fields) {
      if (password == WebAuth[0].WebAuth_Pass){
          conn.query(sql2,[passwordchange], function (err, WebAuthChange,fields){
          });
            res.redirect('/Setting');
        } else {
            res.send('<script type="text/javascript">alert("비밀번호 다시 확인해주세요");document.location="Setting";</script> ');
        }
    });
})


//[Post] /AddDepartmentmodal (부서 추가)
app.post('/AddDepartmentmodal', (req, res) => {
    var Department_Name = req.body.Department_Name;
    // [insert] 부서 추가
    var sql1 = 'insert into Department(Department_Name) values (?);';
    conn.query(sql1,[Department_Name],function(err,tmp,fields){
      });
    res.redirect('Setting');
})

// [Post] /DeleteDepartmentmodal (부서 삭제)
app.post('/ViewDepartmentmodal', (req, res) => {
    var id = req.body.departmentcheck;
    console.log(id);
    // [delete] 부서 삭제
    var sql1 = 'delete from Department where Department_No = ?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items + "[Departmentdeleted]");
            conn.query(sql1, [items], function (err, result) {});
            });
        } else {
            console.log(id + "[Departmentdeleted]");
            conn.query(sql1, [id], function (err, result) {});
        }
    res.redirect('/Setting');
});

//[Post] /Addpositions_name (직책 추가)
app.post('/AddPositionmodal', (req, res) => {
    var Positions_Name = req.body.Positions_Name;
    // [insert] 직책 추가
    var Positions_Name = req.body.Positions_Name;
    // [insert] 부서 추가
    var sql1 = 'insert into Positions(Positions_Name) values (?);';
    conn.query(sql1,[Positions_Name],function(err,tmp,fields){
      console.log(tmp);
    });
  res.redirect('Setting');
});

// [Post] /DeletePositionmodal (부서 삭제)
app.post('/ViewPositionmodal', (req, res) => {
    var id = req.body.positionscheck;
    console.log(id);
    // [delete] 부서 삭제
    var sql1 = 'delete from Positions where Positions_No = ?';
    if (Array.isArray(id) == true) {
        id.forEach(function (items) {
            console.log(items + "[Positionsdeleted]");
            conn.query(sql1, [items], function (err, result) {});
        });
    } else {
        console.log(id + "[Positionsdeleted]");
        conn.query(sql1, [id], function (err, result) {});
    }
    res.redirect('/Setting');
});


// [Get] / (로그인 페이지)
app.get('/', (req, res) => {
    res.render('Login');
});

// [Get] Error (에러)
app.get('*', function (req, res, next) {
    throw new Error();
});

// [Get] Error page (에러 페이지)
app.use(function (error, req, res, next) {
    res.render('Error');
});

module.exports = app;
