var MySQLPool = require("mysql-pool").MySQLPool;
var sprintf = require("sprintf").sprintf;
var fs = require("fs");
var yaml = require('yamlparser');
var dateFormat = require("dateformat");

dateFormat.masks.notwork = "\"notwork_\"yyyymmdd"

var databaseName = dateFormat(new Date(), "notwork");
var databaseConn = 6;

(function() {
        Database = function(config) {
		this.databaseUser = config.mysqlUser;
		this.databasePass = config.mysqlPass;
		this.databaseName = databaseName;
		this.databaseConn = databaseConn;

		this.hardwareId = config.hardwareId;

		console.log(sprintf("[mysql] user '%s', password '%s'", this.databaseUser, this.databasePass));
	
		try {
			this.pool = new MySQLPool({
				poolSize: this.databaseConn,
				user:     this.databaseUser,
				password: this.databasePass
			});
		} catch (e) {
			console.log("[WARNING] could not create mysql pool", e.message);
		}

		this.makeSession(this.databaseName);
	};

	Database.prototype = {
		pool: null,

		databaseName: "",
		databaseUser: "",
		databasePass: "",
		databaseConn: 1,

		hardwareId: "",

		hit: function(user, timestamp, contentId) {
			if (!this.pool) {
				return;
			}

			var that = this;
			if (timestamp >= 0) {
				this.pool.query("insert into " + that.databaseName + ".hits (timestamp, user, hardwareId, contentId) values (?, ?, ?, ?)",
					[timestamp, user, this.hardwareId, contentId], function(err) { that.trackError(err, "not tracking content calls"); }
				);
			} else {
				this.pool.query("insert into " + that.databaseName + ".hits (user, hardwareId, contentId) values (?, ?, ?)",
					[ user, this.hardwareId, contentId], function(err) { that.trackError(err, "not tracking content calls") }
				);
			}
		},

		uie: function(x) {
			if (x == undefined) {
				return "";
			} else {
				return x;
			}
		},

		addContent: function(contents) {
			if (!this.pool) {
				return;
			}

			var that = this;
			var valuesQuery = "";
			var valuesArray = [];

			var first = true;

			for (k in contents) {
				var content = contents[k];
				
				valuesQuery += sprintf("%s(?, ?, ?, ?)", first ? "" : ", ");

				valuesArray.push(content.id);
				valuesArray.push(this.hardwareId);
				valuesArray.push(content.type);
				valuesArray.push(content.title);

				first = false;
			}

			if (!first) {
				this.pool.query("select sleep(2); delete from " + that.databaseName + ".content; insert into " + that.databaseName + ".content (id, hardwareId, type, title) values " + valuesQuery, valuesArray, function (err) { that.trackError(err, "cannot add content map") });
			} else {
				this.pool.query("delete from " + that.databaseName + ".content;");
			}
		},

		form404: function(userId, feedback,res) {
			if (!this.pool) {
				return;
			}

			var that = this;
			this.pool.query("insert into " + that.databaseName + ".form404 (userId, hardwareId, feedback) values (?, ?, ?)",
				[ userId, this.hardwareId, feedback ],
				function(err, result) {
					if(err){
						that.trackError(err, "404 form did not log");
						res.send("failed");
					}else{
						res.send("success");	
					}
				});
		},

		missedConnectionUserInfo: function(userId, avatar, age, orientation, gender, question, interested, favcake, username) {
			if (!this.pool) {
				return;
			}

			var that = this;
			this.pool.query("insert into " + that.databaseName + ".mcUserInfo (userId, hardwareId, avatar, age, orientation, gender, question, interested, favcake, username) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
				[ userId, this.hardwareId, avatar, age, orientation, gender, question, interested, favcake, username ],
				function (err) { that.trackError(err, "missed connection user info did not log") });
		},

		logChat: function(userId, chatId, text) {
			if (!this.pool) {
				return;
			}

			var that = this;

			this.pool.query("insert into " + that.databaseName + ".chatLog (userId, hardwareId, chatId, text) values (?, ?, ?, ?)",
				[userId, this.hardwareId, chatId, text], function(err) { that.trackError(err, "not tracking logs"); }
			);
		},

		feedback: function(user,req,res) {
			if (!this.pool) {
				return;
			}

			var that = this;
			this.pool.query("insert into " + this.databaseName + ".feedback (user, hardwareId, name, email, phone, twitter, url, hidingplace, subject, message) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
				[ this.uie(user.user),
				  this.uie(this.hardwareId),
				  this.uie(user.name),
				  this.uie(user.email),
				  this.uie(user.phone),
				  this.uie(user.twitter),
				  this.uie(user.url),
				  this.uie(user.hidingplace),
				  this.uie(user.subject),
				  this.uie(user.message) ],
				function(err, result) {
					if(err){
						that.trackError(err, "not logging feedback");
						res.send("failed");
					}else{
						res.send("success");	
					}
				});
				
		},

		makeSession: function(databaseName) {
			if (!this.pool) {
				return;
			}

			var that = this;

			console.log("using database", this.databaseName);

			var query = sprintf("create database if not exists %s;\n", this.databaseName);
			query += sprintf("use %s;\n", this.databaseName);
			query += fs.readFileSync("./sql/session.sql");

			this.pool.query(query, function(err) { that.trackError(err, "could not create database") });
		},

		trackError: function(err, result) {
			var that = this;

			if (err) {
				console.log(sprintf("[warning] mysql error, %s (database '%s', user '%s', pass '%s')", result, this.databaseName, this.databaseUser, this.databasePass));
				console.log("[warning]", err.message);
			}
		}
	};
})();

//db = new Database("notwork_20111030", 6, "root", "");
//db.hit("abcd", -1, 1);

//db = new Database({"mysqlUser": "root", "mysqlPass": "", "hardwareId": "testestomg"});
//db.missedConnectionUserInfo: function(userId, avatar, age, orientation, gender, question, interested, favcake, username);
//db.missedConnectionUserInfo(1234, "a", "b", "c", "d", "e", "f", "g", "h");
//db.logChat(1234, "1234-4321", "hey what's up");


