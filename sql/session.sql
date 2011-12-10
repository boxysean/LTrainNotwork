CREATE TABLE IF NOT EXISTS hits (
    id INT NOT NULL auto_increment,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user VARCHAR(32) NOT NULL,
    hardwareId VARCHAR(32) NOT NULL,
    contentId INT NOT NULL,
    PRIMARY KEY (hardwareId, id)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS feedback (
    id INT NOT NULL auto_increment,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user VARCHAR(32) NOT NULL,
    hardwareId VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    twitter VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    hidingplace VARCHAR(1024) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    PRIMARY KEY (hardwareId, id)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS content (
    id INT NOT NULL,
    hardwareId VARCHAR(32) NOT NULL,
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    PRIMARY KEY (hardwareId, id)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS form404 (
    id INT NOT NULL auto_increment,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userId INT NOT NULL,
    hardwareId VARCHAR(32) NOT NULL,
    feedback TEXT NOT NULL,
    PRIMARY KEY (hardwareId, id)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS mcUserInfo (
    id INT NOT NULL auto_increment,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userId INT NOT NULL,
    hardwareId VARCHAR(32) NOT NULL,
    avatar VARCHAR(32) NOT NULL,
    age VARCHAR(32) NOT NULL,
    orientation VARCHAR(32) NOT NULL,
    gender VARCHAR(32) NOT NULL,
    question VARCHAR(32) NOT NULL,
    interested VARCHAR(32) NOT NULL,
    favcake VARCHAR(32) NOT NULL,
    username VARCHAR(255) NOT NULL,
    PRIMARY KEY (hardwareId, id)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS chatLog (
    id INT NOT NULL auto_increment,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    userId INT NOT NULL,
    hardwareId VARCHAR(32) NOT NULL,
    chatId VARCHAR(64) NOT NULL,
    text TINYTEXT NOT NULL,
    PRIMARY KEY (hardwareId, id)
) ENGINE = MYISAM;

