'use strict';
const TAG = " loadBalance.js -  ",
  _ = require('underscore'),
  log = require('../Environment/log4js.js'),
  dbConfig = require('../Environment/mongoDatabase.js'),
  helper = require('./util'); //helper functions

// function to get Rendering % History
exports.getRenderChangesHistory = (req, callback) => {

  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7)
  }
  const db = dbConfig.mongoDbConn;
  const logger = log.logger_loadBalance;
  logger.info(ip + TAG + "Inside getRenderChangesHistory function");
  logger.info(ip + TAG + "Input body: " + JSON.stringify(req.query));

  db.collection('renderChangesHistory').findOne({ 'clientIpAddress': ip })
    .then(res => {
      if (res) {
        logger.info(TAG + "Succesfully fetched Render Changes History")
        callback(false, helper.outputResult(res.renderChanges));
      } else {
        logger.info(TAG + "No Render Changes History found")
        callback(false, helper.outputResult([]));
      }
    }).catch(err => {
      console.log("err: ", err.stack ? err.stack : JSON.stringify(err));
      logger.error(TAG + "Error Computing Render Percentage,err: " + JSON.stringify(err))
      callback(true, helper.internalServerError())
    })
} 