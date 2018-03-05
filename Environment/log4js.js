var TAG = 'log4js.js';
var log4js = require('log4js');
var env = require('./env.js').env;
var fs = require('fs');
var os = require('os');

var instanceId = process.env.NODE_APP_INSTANCE ? process.env.NODE_APP_INSTANCE : '0';

var folderSuffix = os.hostname() + '-' + instanceId;

var logger_loadBalance;
var logger_socket;

var log4jsEnv = {
	"prd":
		{
			"logDir": "/usr/NodeJslogs",
			"logLevel": "INFO",
			"maxLogSize": 10048576, //10MB
			"backups": 10
		},

	"stg":
		{
			"logDir": "/usr/NodeJslogs",
			"logLevel": "DEBUG",
			"maxLogSize": 10048576,
			"backups": 5
		},

	"dev":
		{
			"logDir": "/usr/NodeJslogs",
			"logLevel": "DEBUG",
			"maxLogSize": 10048576,
			"backups": 5
		},
	"loc":
		{
			"logDir": "/usr/NodeJslogs",
			"logLevel": "DEBUG",
			"maxLogSize": 10048576,
			"backups": 3
		}
};


var log4jsEnvParams = null;
if (env === 'prd') {
	log4jsEnvParams = log4jsEnv.prd;
} else if (env === 'stg') {
	log4jsEnvParams = log4jsEnv.stg;
} else if (env === 'dev') {
	log4jsEnvParams = log4jsEnv.dev;
} else {
	log4jsEnvParams = log4jsEnv.loc;
}

var logDir = log4jsEnvParams.logDir + '/' + folderSuffix;

var maxLogSize = log4jsEnvParams.maxLogSize;

var backups = log4jsEnvParams.backups;

var logLevel = log4jsEnvParams.logLevel;

var log4jsConfig = {

	"appenders": [
		{
			"type": "file",
			"filename": logDir + "/" + "loadBalance.log",
			"maxLogSize": maxLogSize,
			"backups": backups,
			"category": "loadBalance"
		},
		{
			"type": "file",
			"filename": logDir + "/" + "socket.log",
			"maxLogSize": maxLogSize,
			"backups": backups,
			"category": "socket"
		}
	]
};

function createLogDir(callback) {
	fs.exists(logDir, function (exists) {
		if (!(exists)) {
			fs.mkdir(logDir, function (err) {
				if (err) {
					console.log("Log Directory Cannot be Created: " + logDir + "." + err);
					throw new Error();
				} else {
					callback(true, "Log Directory created: " + logDir);
				}
			});
		} else {
			callback(true, "Log Directory Exists: " + logDir);
		}
	});
}


//Configure logger_sp, logger_sup
createLogDir(function (success, result) {

	if (success) {
		//Log for Service Provider.
		log4js.configure(log4jsConfig, {});

		logger_loadBalance = log4js.getLogger("loadBalance");
		logger_loadBalance.setLevel(logLevel);
		exports.logger_loadBalance = logger_loadBalance;

		//Log for socket.
		logger_socket = log4js.getLogger("socket");
		logger_socket.setLevel(logLevel);
		exports.logger_socket = logger_socket;
	}
});
