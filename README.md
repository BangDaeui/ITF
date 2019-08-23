<p align="center"><img width="100%" src="png/ITF.PNG" /></p>

--------------------------------------------------------------------------------
이 레포지토리는 문서중앙화 프로젝트 내용을 포함하고 있습니다.

<br/>


## Paper

### Team Leader
* [Sanhae Kang](https://github.com/tksgo1995)

### Team members
* [Kuhyun Kim](https://github.com/birchtreeKim)
* [Youngtae Kim](https://github.com/kim0tae)
* [Heonji Hwang](https://github.com/HeonjiHwang)
* [Sangmin Hu](https://github.com/ViGilanteAF)
* [Daeui Bang](https://github.com/BangDaeui)
* [Kyujin Kim](https://github.com/laida9)

## Dependencies
* [Node.js 10.16.0](https://nodejs.org/en/)

## Node module
* [express]
* [app]
* [mysql]
* [body-parser]
* [path]
* [child_process]
* [async]
* [cookie-parser]
* [fast-csv]
* [fs]
* [os]
* [multer]
* [randomstring]
* [get-folder-size]
* [tls]
* [net]

## Usage

### 1. Cloning the repository
```bash
$ git clone https://github.com/BangDaeui/ITF.git
$ cd ITF/
```

### 2. Setting RDS
```bash
$ cd readme
```
Use SQL1.txt and SQL2.txt in RDS

```bash
$ cd ..
$ vi page.js
	host: 'rdshost',
	user: 'username',
	password: 'password',
	database: 'itf',
```

### 3. Run
```
$ node app.js
```

