drop table accounts;
CREATE TABLE accounts(
    id int AUTO_INCREMENT,
    uuid varchar(128) not null,
    username varchar(64) not null,
    password varchar(64) not null,
    created_at DATETIME DEFAULT now(),
    updated_at DATETIME,
    deleted_at DATETIME,

    CONSTRAINT PK_Accounts PRIMARY KEY (id)
);

CREATE TABLE text(
    id int AUTO_INCREMENT,
    account_uuid varchar(128) not null,
    text_uuid varchar(128) not null,
    title varchar(64) not null,
    content varchar(128) not null,
    status enum('Active', 'Inactive') DEFAULT 'Active',
    created_at DATETIME DEFAULT now(),
    updated_at DATETIME not null,
    deleted_at DATETIME not null,

    CONSTRAINT PK_Text PRIMARY KEY (id)
);