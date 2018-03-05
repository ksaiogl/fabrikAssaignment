const TAG = 'app.js',
  express = require('express'),
  app = express(),
  path = require('path'),
  bodyParser = require('body-parser'),
  server = require('http').createServer(app),
  io = require('socket.io')(server),
  env = require('./Environment/env.js').env,
  dbConfig = require('./Environment/mongoDatabase.js'),
  log = require('./Environment/log4js.js'),
  hosts = require('./Environment/hosts');


app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

//CORS headers.
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

io.set('transports', ['websocket']);

//Routing
var loadBalance = require('./routes/index');
var socketFile = require('./routes/socket');

app.use('/loadBalance', loadBalance);
app.use(express.static(path.join(__dirname, 'public')));

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

var clientSocket = io.of('/user');
exports.clientSocket = clientSocket;

dbConfig.createMongoConn(function (error) {
  if (error) {    
    console.log('Unable to connect to the mongoDB server. Error:', error);
  }
  else {

    const port = hosts.getPort[env];

    server.listen(port, (err, res) => {
      if (!err) {

        console.log('Listening on port :', port);

        clientSocket.on('connection', socket => {

          var clientIpAddress = socket.handshake.address;
          if (clientIpAddress.substr(0, 7) == "::ffff:") {
            clientIpAddress = clientIpAddress.substr(7)
          }
          console.log('new connection established on User Socket from ' + clientIpAddress);

          socket.on('temperatureUpdated', (data) => {
            data.clientIpAddress = clientIpAddress;
            socketFile.computeRenderPercentage(data, (err, res) => {
              console.log("Data sent succesfully");
              socket.emit('updatedRenderPercentage', err, res);
            })
          })

          socket.on('disconnect', () => {
            console.log('connection closed on User Socket');
          })

        })
      } else {
        console.log("Error starting server,err: ", err.stack);
      }
    })
  }
});