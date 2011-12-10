const fs = require('fs');
const yaml = require('yamlparser');

(function() {
        Configuration = function(configFile) {
		var config = [];

		try {
			var str = fs.readFileSync(configFile, "utf8");
			config = yaml.eval(str);
		} catch (err) {
			console.log("[WARNING] could not open", configFile, err);
		}

		this.mysqlUser = this.get(config, "mysqlUser", "root");
		this.mysqlPass = this.get(config, "mysqlPass", "");
		this.hardwareId = this.get(config, "hardwareId", "Xerxes");
		this.authentication = this.get(config, "authentication", false);
		this.port = this.get(config, "port", 3000);
		this.mode = this.get(config, "mode", "development");

		console.log("[configuration]", config);
        };

        Configuration.prototype = {
                mysqlUser: "",
		mysqlPass: "",
		hardwareId: "",
		authentication: true,
		port: 3000,
		mode: "",

		get: function(config, key, def) {
			if (key in config) {
				return config[key];
			} else {
				return def;
			}
		}
	};
})();


