'use strict';
const TAG = " loadBalance.js -  ",
    log = require('../Environment/log4js.js'),
    dbConfig = require('../Environment/mongoDatabase.js'),
    _ = require('underscore'),
    config = require('./config');

exports.computeRenderPercentage = (input, callback) => {
    const ip = input.ip;
    const db = dbConfig.mongoDbConn;
    const logger = log.logger_loadBalance;
    logger.info(ip + TAG + "Inside computeRenderPercentage");
    logger.info(ip + TAG + "Input body: " + JSON.stringify(input));
    console.log(input);
    if (input && input.ip && input.temperature && input.clientType) {

        getRenderLoadBalancingPercentage(input)
            .then((renderChange) => { return updateRenderChangesToDB(input, renderChange) })
            .then(renderPercentageData => {
                callback(false, outputResult(renderPercentageData))
            })
            .catch(err => {
                console.log(err);
                if ("http_code" in err && "message" in err) {
                    return callback(true, err);
                } else {
                    logger.error(TAG + "Error Computing Render Percentage,err: " + err.stack)
                    return callback(true, internalServerError());
                }
            });
    } else {
        console.log("111111");
        logger.error(TAG + "Bad or ill-formed request");
        return callback(true, badFormat("Statements is mandatory and must be a non-empty array"));
    }
}

const getRenderLoadBalancingPercentage = (input) => {
    return new Promise((resolve, reject) => {
        input.temperatureRange = getTempeartureRange(input.temperature)
        resolve(config.loadBalanceMappings[input.clientType][input.temperatureRange])
    })
}
const updateRenderChangesToDB = (input, renderChange) => {

    const db = dbConfig.mongoDbConn;

    return new Promise((resolve, reject) => {
        renderChange['temperature'] = input.temperature;
        renderChange['timestamp'] = new Date();
        db.collection('renderChangesHistory').update({ 'ip': input.ip },
            { $push: { 'renderChanges': { $each: [renderChange], $sort: { timestamp: -1 } } } }, { upsert: true })
            .then(res => {
                resolve(renderChange)
            })
            .catch(err => {
                console.log(err.stack);
                reject(internalServerError())
            })
    })
}

const getTempeartureRange = (temperature) => {
    if (temperature < 30) {
        return 'lessThan30';
    } else if (temperature >= 30 && temperature <= 40) {
        return 'between30And40';
    } else {
        return 'greaterThan40';
    }
}


const badFormat = (errors) => {
    const result = {
        "http_code": "400",
        "message": "Bad or ill-formed request..",
        "errors": errors
    };
    return result;
};

const inputDontMatch = () => {
    const result = {
        "http_code": "404",
        "message": "The inputs does not match with our records..Please retry.."
    };
    return result;
};

const internalServerError = () => {
    const result = {
        "http_code": "500",
        "message": "Internal Server Error..Please retry.."
    };
    return result;
};

const outputResult = (result) => {
    const resJson = {
        "http_code": "200",
        "message": result
    };
    return resJson;
};

const makeResult = (statusCode, message) => {
    const result = {
        "http_code": statusCode,
        "message": message
    };
    return result;
};