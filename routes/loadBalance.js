'use strict';
const TAG = " loadBalance.js -  ",
  log = require('../Environment/log4js.js'),
  dbConfig = require('../Environment/mongoDatabase.js'),
  _ = require('underscore');

exports.getRenderChanges = (req, callback) => {

  const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  const db = dbConfig.mongoDbConn;
  const logger = log.logger_loadBalance;
  logger.info(ip + TAG + "Inside getRenderChanges");
  logger.info(ip + TAG + "Input body: " + JSON.stringify(req.query));
  // if (req && req.query && req.query.ip) {

  // getUserOldReviewsFromDB(req)
  //   .then(getOnlyNewReviews)
  //   .then(computeSentimentAnalysisForNewReviews)
  //   .then((d) => { return insertNewReviewsIntoDB(req, d) })
  //   .then(formResponse)
  //   .then(sentimentAnalysisData => {
  //     callback(false, outputResult(sentimentAnalysisData))
  //   })
  //   .catch(err => {
  //     if ("http_code" in err && "message" in err) {
  //       return callback(true, err);
  //     } else {
  //       logger.error(TAG + "Error Computing Sentiment Analysis,err: " + err.stack)
  //       return callback(true, internalServerError());
  //     }
  //   });

  db.collection('renderChangesHistory').findOne({ 'ip': ip })
    .then(res => {
      if (res) {
        callback(false, outputResult(res.renderChanges));
      } else {
        callback(false, outputResult([]));
      }
    }).catch(err => {
      callback(true, internalServerError())
    })

  // } else {
  //   logger.error(TAG + "Bad or ill-formed request");
  //   return callback(true, badFormat("Statements is mandatory and must be a non-empty array"));
  // }
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