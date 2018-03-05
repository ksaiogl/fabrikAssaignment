var TAG = 'mongoDatabase.js';
var mongoClient = require('mongodb').MongoClient;
var async = require('async');

var env = require('./env.js').env;
console.log(TAG + " " + "Deployment Environment is: " + env);

var dbConfig = {
    "prd":
        {
            "type": "replicaSet",
            "user": "",
            "pwd": "",
            "mongod": [],
            "database": "fabrikDB"
        },
    "stg":
        {
            "type": "singleInstance",
            "user": "",
            "pwd": "",
            "mongod": [],
            "database": "fabrikDB"
        },
    "dev":
        {
            "type": "singleInstance",
            "user": "",
            "pwd": "",
            "mongod": ["18.219.91.243:27017"],
            "database": "fabrikDB"
        },
    "loc":
        {
            "type": "singleInstance",
            "user": "",
            "pwd": "",
            "mongod": ["127.0.0.1:27017"],
            "database": "fabrikDB"
        }
};

var connParams = null;
if (env === 'prd') {
    connParams = dbConfig.prd;
} else if (env === 'stg') {
    connParams = dbConfig.stg;
} else if (env === 'dev') {
    connParams = dbConfig.dev;
} else {
    connParams = dbConfig.loc;
}
var mongod = connParams.mongod;

var databaseURL = null;
var mongoDbConn = null;

var hosts = null;
for (var i = 0; i < mongod.length; i++) {
    if (i === 0) {
        hosts = mongod[0];
    } else {
        hosts = hosts + ',' + mongod[i];
    }
}

var dbConnUrl = null;
var dbConnUrlSecondary = null;
if (!(connParams.user === "" && connParams.pwd === "")) {
    dbConnUrl = 'mongodb://' + connParams.user + ':' + connParams.pwd + '@' + hosts + '/' + connParams.database;
    console.log(dbConnUrl);
} else {
    dbConnUrl = 'mongodb://' + hosts + '/' + connParams.database;
}

exports.createMongoConn = function (callback) {
    mongoClient.connect(dbConnUrl, { poolSize: 10, connectTimeoutMS: 60000, socketTimeoutMS: 500000 }, function (err, database) {
        if (err) {
            console.log('Error connecting to DB. Err : \n' + err);
            callback(err);
        } else {
            console.log('Connection established to: ', dbConnUrl);
            console.log('DB connection successfull.');
            exports.mongoDbConn = database;
            callback(false);
        }
    });
}
