'use strict';
const TAG = " socket.js -  ",
    _ = require('underscore'),
    log = require('../Environment/log4js.js'),
    dbConfig = require('../Environment/mongoDatabase.js'),
    config = require('./config'),
    helper = require('./util');

// function to compute render % based on tempearture
exports.computeRenderPercentage = (input, callback) => {
    const db = dbConfig.mongoDbConn;
    const logger = log.logger_loadBalance;
    logger.info(TAG + "Inside computeRenderPercentage");
    logger.info(TAG + "Input body: " + JSON.stringify(input));

    if (input && input.clientIpAddress && typeof input.temperature == 'number' && input.clientType) {

        getRenderLoadBalancingPercentage(input)
            .then((renderChange) => { return updateRenderChangesToDB(input, renderChange) })
            .then(renderPercentageData => {
                logger.info(TAG + "Succesfully Computed Render Percentage")
                callback(false, helper.outputResult(renderPercentageData))
            })
            .catch(err => {
                console.log("err: ", err.stack ? err.stack : JSON.stringify(err));
                logger.error(TAG + "Error Computing Render Percentage,err: " + JSON.stringify(err))
                return callback(true, internalServerError());
            });

    } else {
        logger.error(TAG + "Bad or ill-formed request");
        return callback(true, helper.badFormat("clientIpAddress,temperature,clientType are mandatory"));
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
        db.collection('renderChangesHistory')
            .update({ 'clientIpAddress': input.clientIpAddress },
                { $push: { 'renderChanges': { $each: [renderChange], $sort: { timestamp: -1 } } } }, { upsert: true })
            .then(res => {
                resolve(renderChange)
            })
            .catch(err => {
                console.log(err.stack);
                reject(helper.internalServerError())
            })
    })
}

//helper functions

const getTempeartureRange = (temperature) => {
    if (temperature < 30) {
        return 'lessThan30';
    } else if (temperature >= 30 && temperature <= 40) {
        return 'between30And40';
    } else {
        return 'greaterThan40';
    }
}