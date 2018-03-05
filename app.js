const TAG = 'app.js',
  express = require('express'),
  app = express(),
  env = require('./Environment/env.js').env,
  routes = require('./routes/index.js'),
  path = require('path'),
  server = require('http').createServer(app),
  io = require('socket.io')(server),
  dbConfig = require('./Environment/mongoDatabase.js'),
  log = require('./Environment/log4js.js'),
  bodyParser = require('body-parser');

global.__basedir = __dirname;


app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));


//CORS issue in the Browser.
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

// io.set('origins', 'http://localhost' + ':*');
io.set('transports', ['websocket']);

//Routing
var loadBalance = require('./routes/index');
var socketFile = require('./routes/socket');

app.use('/loadBalance', loadBalance);
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'jade');



// app.get('/Auction', function (req, res) {
// 	res.render(__dirname + '/public/inquiryTemplate', {
// 		url: 'http://localhost:8083' + '/Auction',
// 		type: 'Auction'
// 	});
// });

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    http_code: err.status || 500,
    message: err.message
  });
  console.log("req:- " + req.url);
  console.log("time : " + new Date());
  console.log("error triggered from app.js:- " + err.stack);
});

var user = io.of('/user');
exports.user = user;

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    http_code: err.status || 500,
    message: err.message
  });
  console.log("req:- " + req.url);
  console.log("time : " + new Date());
  console.log("error triggered from app.js:- " + err.stack);
});
dbConfig.createMongoConn(function (error) {
  if (error) {
    console.log('Unable to connect to the mongoDB server. Error:', error);
  }
  else {
    if (env === "prd") {
      server.listen(8080);
      console.log('Listening on port 8080');
    } else if (env === "stg") {
      server.listen(8081);
      console.log('Listening on port 8081');
      console.log(process.env.NODE_APP_INSTANCE);
    } else if (env === "dev") {
      server.listen(8082);
      console.log('Listening on port 8082');
    } else if (env === "demo") {
      server.listen(8080);
      console.log('Listening on port 8080');
    } else {
      //loc
      server.listen(8083);
      console.log('Listening on port 8083');
    }

    user.on('connection', socket => {
      console.log('new connection established on User Socket');
      var address = socket.handshake.address;
      console.log('New connection from ' + address);
      socket.on('temperatureUpdated', (data) => {
        data.ip = address
        console.log("data.ip: ", data.ip);
        socketFile.computeRenderPercentage(data, (err, res) => {
          if (!err) {
            console.log("data sent");
            socket.emit('updatedRenderPercentage', err, res)
          } else {
            console.log("err: ", err.stack);
            socket.emit('updatedRenderPercentage', err, res)
          }
        })
      });
      socket.on('disconnect', () => {
        console.log('connection closed on User Socket');
      });
    });
  }
});


process.on('SIGTERM', function () {
  shutdown('SIGTERM');
});

process.on('SIGINT', function () {
  shutdown('SIGINT');
});

var shutdown = event => {
  console.log('Event triggered : ' + event);
  function graceful() {
    agendaConfig.agenda.stop(function () {
      // process.exit(0);
    });
  }
  server.close(() => {
    console.log("Finished all requests");
    dbConfig.mongoDbConn.collection('auctions').remove({}, (err) => {
      if (!err) {
        console.log("cleared auctions");
      } else {
        console.log("err: " + err.stack);
        process.exit(err ? 1 : 0);
      }
    })

  });
}
