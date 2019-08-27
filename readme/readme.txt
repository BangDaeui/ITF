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