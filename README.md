# L Train Notwork

## Installation instructions

1. Compile using `make`
2. Launch using `node app.js`
3. Open `http://localhost:8080`

## Launching with [forever](http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever)

Run using `./scripts/launch` from the command line.

## About

We used this framework to serve content to mobile phones on the New York City subway.

Every morning on Nov 18-22 2011, L train the last few subway cars between on Morgan Ave and 8th Ave had wireless access to this site with curated content.

More info can be found on [our press release](http://wemakecoolsh.it/#2300081/L-Train-Notwork-Press-Release), at [Wired](http://www.wired.com/epicenter/2011/11/all-aboard-nyc-geek-train/), or in [this video](http://vimeo.com/32149926).

Read our technical documentation including hardware configuration and specs.

We encourage you to take this model and deploy your very own notwork.

## Troubleshooting

### Q: Why do I get the following stack trace?

	Error: Cannot find module 'node-proxy'
	    at Function._resolveFilename (module.js:326:11)
	    at Function._load (module.js:271:25)
	    at require (module.js:355:19)
	    at Object.<anonymous> (/Users/boxysean/Documents/workspace/notwork/node_modules/now/lib/proxy.js:10:13)
	    at Module._compile (module.js:411:26)
	    at Object..js (module.js:417:10)
	    at Module.load (module.js:343:31)
	    at Function._load (module.js:302:12)
	    at require (module.js:355:19)
	    at Object.<anonymous> (/Users/boxysean/Documents/workspace/notwork/node_modules/now/lib/group.js:3:13)

### A: Run `make`.

## Credits

- [Sean McIntyre](http://www.boxysean.com)
- [Chee Seng Sim](http://simmu.net/)
- [WeMakeCoolSh.it](http://wemakecoolsh.it/)
