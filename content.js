var fs = require('fs');
var yaml = require('yamlparser');
var sprintf = require('sprintf').sprintf;
var dateFormat = require("dateformat");

dateFormat.masks.featured = "yyyy/mm/dd";

const LINE_BREAK = "%0A%0A";
const MAIL_LINK_RE = /MAIL_LINK\( *([^)]*) *,, *([^)]*) *,, *([^)]*) *,, *([^)]*) *\)/;

function createMailToLink(subject, body, link, linkText) {
	var emailInstr = "~^*^~" + LINE_BREAK + "Send this article to yourself by entering your email address in the to field above." + LINE_BREAK + "Hit send, and it will show up in your inbox when you connect to the real internet once you get off the train." + LINE_BREAK + "~^*^~" + LINE_BREAK;

	var emailFooter = LINE_BREAK + "The L Train Notwork is brought to you by http://WeMakeCoolSh.it";

	if (linkText == undefined || linkText.length == 0) {
		linkText = "Email this to myself";
	}

	return sprintf("<a href=\"mailto:?subject=%s&body=%s%s%s%s%s\">%s</a>", "[ltrainnotwork.com] " + subject.replace(/"/g, "'"), emailInstr, body.replace(/"/g, "'"), LINE_BREAK, link, emailFooter, linkText);
}

function parseMailLink(text) {
	do {
		var m = MAIL_LINK_RE.exec(text);

		if (!m) {
			break;
		}

		var one = text.substring(0, m.index);
		var two = createMailToLink(m[1], m[2], m[3], m[4]);
		var three = text.substring(m.index + m[0].length);
		text = one + two + three;
	} while (true);

	return text;
}

/*var text = "text1 MAIL_LINK(asdf,x,fdsa) text2 MAIL_LINK( qwer, y, reqwe ) text3";
console.log(text);
console.log(parseMailLink(text));
*/

(function() {
	Content = function(folder, webFolder, database) {
		this.folder = folder;
		this.webFolder = webFolder;
		this.database = database;

		var photoGalleries = this.initPhotoGallery();
		var news = this.initText("news");
		var literature = this.initText("literature");
		var poetry = this.initText("poetry");
		var prose = this.initText("prose");
//		var audio = this.initText("audio");
		var listJson = function(x) { return x.getListing(); };

		this.categories = {
//			"audio": [].concat(audio).map(listJson),
			"prose": [].concat(prose).map(listJson),
			"poetry": [].concat(poetry).map(listJson),
			"literature": [].concat(literature).map(listJson),
			"feeds": [].concat(news).map(listJson),
			"images": [].concat(photoGalleries).map(listJson)
		};

		var isFeatured = function(x) { return x.isFeatured(); };
//		var isFeatured = function(x) { return true };

		var strcmp = function(a, b) { return ((a == b) ? 0 : ((a > b) ? 1 : -1)) };
		var ordercmp = function(a, b) { return ((a.order == b.order) ? 0 : ((a.order > b.order) ? 1 : -1)) };

//		var featuredAudio = [].concat(audio.filter(isFeatured)).map(listJson).sort(strcmp);

		var featuredWords = [].concat(literature.filter(isFeatured), prose.filter(isFeatured), poetry.filter(isFeatured)).sort(ordercmp).map(listJson);
		var featuredImages = [].concat(photoGalleries.filter(isFeatured)).sort(ordercmp).map(listJson);

		this.featured = {
			featured_content: [/*{
					type: "audio",
					contents: featuredAudio
				}, */{
					type: "words",
					contents: featuredWords
				}, {
					type: "images",
					contents: featuredImages
				}],
			feeds: news.map(listJson)
		};

		this.initContentMap([].concat(/*audio, */photoGalleries, literature, news, prose, poetry));

		return this;
	};

	Content.prototype = {
		folder: null,
		webFolder: null,

		contentMaxId: 0, // next ID to assign
		categores: {},
		featured: {},
		contentMap: {},

		initContentMap: function(contents) {
			this.database.addContent(contents);
			for (var k in contents) {
				var content = contents[k];
				this.contentMap[content.id] = content;
			}
		},

		initPhotoGallery: function() {
			var that = this;
			var res = [];
	
			files = fs.readdirSync(this.folder + "/photogallery");

			for (var k in files) {
				var set = files[k];
				if (set.match(/^[^.].*/)) {
					var pg = new PhotoGallery(that.contentMaxId, that.folder + "/photogallery/" + set, that.webFolder + "/photogallery/" + set);
					res.push(pg);
					that.contentMaxId++;
				}
			}

			return res;
		},

		initText: function(cFolder) {
			var that = this;
			var res = [];
			
			var folder = this.folder + "/" + cFolder;
			var webFolder = this.webFolder + "/" + cFolder;

			files = fs.readdirSync(folder);

			for (var k in files) {
				var file = files[k];
				if (file.match(/.*\.yaml$/)) {
					var text = new Text(that.contentMaxId, folder, file);
					res.push(text)
					that.contentMaxId++;
				}
			}

			return res;
		},

		get: function(userId, contentId) {
			this.database.hit(userId, -1, contentId);
			return this.contentMap[contentId].get();
		},

		getFeatured: function() {
			return this.featured;
		},

		getCategory: function(category) {
			return this.categories[category];
		},

/*		dump: function() {
			for (var contentKey in this.contentMap) {
				var content = this.contentMap[contentKey];
				console.log(contentKey, content["json"].substring(0, 75) + "...");
			}
		}
*/
	};

	// PhotoGallery

	PhotoGallery = function(id, folder, webFolder) {
		this.init(id, folder, webFolder);
		return this;
	};

	PhotoGallery.prototype = {
		listingJson: null,
		contentJson: null,
		
		id: 0,
		title: "",
		description: "",
		type: "",
		textBottom: "",
		textTop: "",
		featured: false,

		init: function(id, folder, webFolder) {
			var that = this;
			var yamlFile = fs.readFileSync(folder + "/gallery.yaml", "utf8");
			var galleryInfo = yaml.eval(yamlFile);

			this.id = id;
			this.title = galleryInfo["title"];
			this.description = galleryInfo["description"];
			this.type = "photo";
			this.featured = galleryInfo["featured"] == dateFormat(new Date(), "featured");
			this.textBottom = parseMailLink(galleryInfo["textBottom"] ? galleryInfo["textBottom"] : "");
			this.textTop = parseMailLink(galleryInfo["textTop"] ? galleryInfo["textTop"] : "");
			this.order = galleryInfo["order"];

			this.listingJson = JSON.stringify({
				"title": this.title,
				"description": this.description,
				"content_id": this.id
			});

			var contentJsonMap = {
				"type": "photo",
				"title": galleryInfo["title"],
				"images": [],
				"textTop": this.textTop,
				"textBottom": this.textBottom
			};
	
			for (var k in galleryInfo["images"]) {
				var image = galleryInfo["images"][k];

				var map	= {
					"thumbnail": webFolder + "/thumbnail/" + image["file"],
					"image_url": webFolder + "/full/" + image["file"]
				};

				if ("title" in image) {
					map["title"] = image["title"];
				}

				contentJsonMap["images"].push(map);
			}

			this.contentJson = JSON.stringify(contentJsonMap);
		},

		get: function() {
			return this.contentJson;
		},

		getListing: function() {
			return this.listingJson;
		},

		isFeatured: function() {
			return this.featured;
		},

		toString: function() {
			return this.folder;
		}
	};

	// Text

	Text = function(id, folder, yamlFile) {
		this.init(id, folder, yamlFile);
		return this;
	};

	Text.prototype = {
		listingJson: null,
		contentJson: null,
		
		id: 0,
		title: "",
		description: "",
		type: "",
		featured: false,
		order: 0,

		init: function(id, folder, yamlFile) {
			var yamlRaw = fs.readFileSync(folder + '/' + yamlFile, "utf8");
			var textInfo = yaml.eval(yamlRaw);

			this.id = id;
			this.title = textInfo["title"];
			this.description = textInfo["description"];
			this.type = textInfo["type"];
			this.featured = textInfo["featured"] == dateFormat(new Date(), "featured");
			this.order = textInfo["order"];

			try {
				var headlines = fs.readFileSync(folder + '/' + textInfo["headlineFile"], "utf8");
				this.description = headlines;
			} catch (err) {
				// nop
			}

			this.listingJson = JSON.stringify({
				"content_id": this.id,
				"title": this.title,
				"description": this.description
			});

			this.contentJson = JSON.stringify({
				"title": this.title,
				"type": this.type,
				"markup": parseMailLink(fs.readFileSync(folder + '/' + textInfo["file"], "utf8"))
			});
		},

		get: function() {
			return this.contentJson;
		},

		getListing: function() {
			return this.listingJson;
		},

		isFeatured: function() {
			return this.featured;
		},

		toString: function() {
			return this.folder;
		}
	}

}());

//require("./database");
//var database = new Database();
//var c = new Content("public/content", "content", database);
//c.dump(); // frustratedly, I made everything asynchronous so that this will indeed return the correct result!!
//console.log(c.getFeatured());
//console.log(c);
//console.log(c.get(0));

//var pg = new PhotoGallery(7, "public/content/photogallery/market", "content/photogallery/market");
//console.log(pg);
//console.log(pg.get());

//var txt = new Text(4, "public/content/story/7.2miles.yaml");
//console.log(txt);
//console.log(txt.get());


