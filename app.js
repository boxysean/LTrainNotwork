
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Generate content lists

require('./configuration');
require('./database');
require('./content');
require('./missconnection');

var config = new Configuration("config.yaml");

var database = new Database(config);
var content = new Content("public/content/", "/content", database);

var missedConnection = new MissedConnection(app, database);


// Very simple authentication

function basic_auth(req, res, next) {
    if (!config.authentication) {
        next();
        return;
    }

    if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
        // fetch login and password
        if (new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString() == 'notwork:coolshit') {
            next();
            return;
        }
    }
    console.log('Unable to authenticate user', req.headers.authorization);
    res.header('WWW-Authenticate', 'Basic realm="Admin Area"');
    if (req.headers.authorization) {
        setTimeout(function () {
            res.send('Authentication required', 401);
        }, 5000);
    } else {
        res.send('Authentication required', 401);
    }
}

// really simple notion of sessions for tracking

var sessionIds = [];

function session(req, res, next) {
	// assign pretty random and long ID to person. not that secure, but it's only used for tracking

	if (!req.cookies.userid || req.cookies.userid == undefined) {
		var id = -1;
		// make sure there are no collisions... luckily the search space is really big so this shouldn't be an issue
		// if you are using this large scale on non-ARM based computers, scrap this entire session function and replace it with session middleware as described by express.js
		// we would have, but ARM and the session middleware won't get along nicely at time of publishing
		while (id < 0) {
			id = Math.floor(Math.random() * (1 << 30));
			if (sessionIds[id]) {
				id = -1;
			}
		}
		sessionIds[id] = true;
		res.cookie("userid", id, { expires: new Date(Date.now() + (4 * 60 * 60 * 1000)) });
	}

	next();
}

// Configure routes

// Redirect any non notwork traffic to notwork
app.configure('production', function(){
	app.use(function(req, res, next){
		var hostname = req.header("host").split(":")[0];
		if (hostname != "www.ltrainnotwork.com") {
			res.redirect('http://www.ltrainnotwork.com/conductor');
			return;
		}

		next();
	});
});

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('view options', { layout: false });
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(basic_auth);
	app.use(session);
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.use(function(req, res, next){
	res.render('404');
});

// Routes

app.get("/content-feed/id/:id", function(req, res) {
	res.contentType("json");
	res.send(content.get(req.cookies.userid, req.params.id));
});

app.get(/\/content\/(.*)/, function(req, res) {
	res.contentType("public/content/" + req.params[0]);
	res.download("public/content/" + req.params[0]);
});

app.get('/dump', function(req, res) {
	content.dump();
	res.send("dump\n");
});

app.get("/category/:category", function(req, res) {
	res.contentType("json");
	res.send(content.getCategory(req.params.category));
});

app.get("/featured", function(req, res) {
	res.contentType("json");
	res.send(content.getFeatured());
});

app.post("/form-submit", function(req, res) {
	database.feedback({
			user:req.cookies.userid,
			name:req.body.name, 
			email:req.body.email, 
			phone:req.body.phone, 
			twitter:req.body.twitter, 
			url:req.body.url, 
			hidingplace:req.body.hidingplace, 
			subject:req.body.subject, 
			message:req.body.message}
			,req,res);
});

app.get('/', function(req, res) {
	res.render('index', {});
});

app.get('/miss-connection', function(req, res){
	res.render('miss-connection', {});
});

app.get('/conductor', function(req, res){
	res.render('conductor', {});
});

app.post('/create-chat-user', function(req, res){
	database.missedConnectionUserInfo(req.cookies.userid, req.body.avatar, req.body.age, req.body.orientation, req.body.gender, req.body.question, req.body.interested, req.body.favcake, req.body.username);
	missedConnection.addUser({
		user_id:req.cookies.userid,
		avatar:req.body.avatar, 
		age:req.body.age, 
		orientation:req.body.orientation, 
		gender:req.body.gender, 
		question:req.body.question, 
		interested:req.body.interested, 
		favcake:req.body.favcake, 
		username:req.body.username, 
	}, res);
});

app.post('/update-profile', function(req, res){
	database.missedConnectionUserInfo(req.cookies.userid, req.body.avatar, req.body.age, req.body.orientation, req.body.gender, req.body.question, req.body.interested, req.body.favcake, req.body.username);
	missedConnection.updateProfile( req.body.userid,{
		avatar:req.body.avatar, 
		age:req.body.age, 
		orientation:req.body.orientation, 
		gender:req.body.gender, 
		question:req.body.question, 
		interested:req.body.interested, 
		favcake:req.body.favcake, 
	},res);
});


app.post('/404-form', function(req, res) {	
	database.form404(req.cookies.userid, req.body.feedback, res);
});

var actionNum = 1;

app.post("/conductor/:user1/:user2/:action", function(req, res) {
	console.log("action", actionNum++, ".", req.params.user1, "and", req.params.user2 + ":", req.params.action + ".");
	//console.log("[conductor] action", actionNum++, ".", req.params.user1, "and", req.params.user2 + ":", req.params.action.replace(/ /g, ",") + ".");
	res.send("success");
});

// Start the app

app.listen(config.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

