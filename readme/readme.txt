Database

	RDS : itf2019.cohnbkqepvge.ap-northeast-2.rds.amazonaws.com
	User : itf2019
	Database : itf

테이블의 UTF-8 설정
	ALTER TABLE (table name) CONVERT TO CHARACTER SET UTF8
삭제 활성화
	SET SQL_SAFE_UPDATES = 0;
auto increment 1로 만들기
	alter table Policy auto_increment=1;

UI

	https://designrevision.com/docs/shards/using-icons.html

개선사항

	Dashboard 구상
	Useradd Modal UI 구현
	Useradd Post 구현
	Userdetail UI 개선
	Useredit UI 개선
	Systempolicyedit UI 개선
	FolderPolicy 생성파일권한 폴더생성권한 UI 개선
	Folderpolicyedit UI 개선
	Setting 비밀번호 변경 UI 구현
	Setting 부서 및 직책 관리 페이지