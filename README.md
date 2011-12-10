# L Train Notwork

## Installation instructions

1. Download our code
2. Install `node` (supported version [0.4.12](https://github.com/joyent/node/zipball/v0.4.12)) and `npm`
3. Install required packages using `npm socket.io express yamlparser mysql-pool sprintf dateformat now`
4. Launch using `node app.js`
5. Open `http://localhost:8080`

## Launching with [forever](http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever)

Run using `./scripts/launch` from the command line.

## About

We used this framework to serve content to mobile phones on the New York City subway.

Every morning from Nov 14 to 18 (2011), the last few subway cars of the L train between on Morgan Ave and 8th Ave had a wireless access point that hosted this site with curated content.

More info can be found on [our press release](http://wemakecoolsh.it/#2300081/L-Train-Notwork-Press-Release), at [Wired](http://www.wired.com/epicenter/2011/11/all-aboard-nyc-geek-train/), or in [this video](http://vimeo.com/32149926).

Read our technical documentation including hardware configuration and specs.

Take this model and deploy your very own notwork!

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

*A:* Run `make`.

### Q: Why do I get the following error when installing packages via npm?

	npm ERR! node-proxy@0.5.2 install: `make`
	npm ERR! `sh "-c" "make"` failed with 2
	npm ERR! 
	npm ERR! Failed at the node-proxy@0.5.2 install script.
	npm ERR! This is most likely a problem with the node-proxy package,
	npm ERR! not with npm itself.
	npm ERR! Tell the author that this fails on your system:
	npm ERR!     make
	npm ERR! You can get their info via:
	npm ERR!     npm owner ls node-proxy
	npm ERR! There is likely additional logging output above.
	npm ERR! 
	npm ERR! System Linux 3.0.0-13-generic
	npm ERR! command "node" "/usr/bin/npm" "install" "now"
	npm ERR! cwd /mnt/br/boxysean/workspace/notwork_github
	npm ERR! node -v v0.4.12
	npm ERR! npm -v 1.0.94
	npm ERR! code ELIFECYCLE
	npm ERR! 
	npm ERR! Additional logging details can be found in:
	npm ERR!     /mnt/br/boxysean/workspace/notwork_github/npm-debug.log
	npm not ok

*A:* This is probably because you are missing node-waf. [More...](http://stackoverflow.com/a/8303324)

## Credits

- [Sean McIntyre](http://www.boxysean.com)
- [Chee Seng Sim](http://simmu.net/)
- [WeMakeCoolSh.it](http://wemakecoolsh.it/)
