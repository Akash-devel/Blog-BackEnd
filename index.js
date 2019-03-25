// this is needed for importing expressJs into our Application 
const express = require('express');
const appConfig = require('./config/appConfig');
const fs = require('fs');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const globalErrorMiddleWare = require('./middlewares/appErrorHandler');
const routeLoggerMiddleware = require('./middlewares/routeLogger');
const helmet = require('helmet');
const logger = require('./libs/loggerLib');
const http = require('http');
// declaring an instance or creating an application instance 
const app = express();

//middlewares (Application level middleware)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }))
app.use(cookieParser());

app.use(globalErrorMiddleWare.globalErrorHandler);
app.use(routeLoggerMiddleware.logIp);
app.use(helmet());

// Bootstrap models
const modelsPath = './models'
fs.readdirSync(modelsPath).forEach(function (file) {
    if(~file.indexOf('.js')) {
        console.log(modelsPath + '/' + file);
         require(modelsPath + '/' + file)
    }
})
// end Bootstrap models

// Bootstrap route
const routesPath = './routes'
fs.readdirSync(routesPath).forEach(function (file) {

    if (~file.indexOf('.js')) {
        console.log("Including the following file");
        console.log(routesPath + '/' + file);
        const route = require(routesPath + '/' + file);
        route.setRouter(app);
    }
});
//end bootstrap route

// Calling global 404 handler after route

app.use(globalErrorMiddleWare.globalNotFoundHandler);

// end global 404 handler

const server = http.createServer(app)
// start listening to http server
console.log(appConfig)
server.listen(appConfig.port)
server.on('error', onError)
server.on('listening', onListening)

// end server listening code
/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        logger.error(error.code + ' not equal listen', 'serverOnErrorHandler', 10)
        throw error
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error(error.code + ':elavated privileges required', 'serverOnErrorHandler', 10)
            process.exit(1)
            break
        case 'EADDRINUSE':
            logger.error(error.code + ':port is already in use.', 'serverOnErrorHandler', 10)
            process.exit(1)
            break
        default:
            logger.error(error.code + ':some unknown error occured', 'serverOnErrorHandler', 10)
            throw error
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address()
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    ('Listening on ' + bind)
    logger.info('server listening on port' + addr.port, 'serverOnListeningHandler', 10)
    let db = mongoose.connect(appConfig.db.uri, { useNewUrlParser: true })
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
    // application specific logging, throwing an error, or other logic here
})

///// For Checking the status of the connection
// handling mongoose connection error
mongoose.connection.on('error', function(err) {  // Error event

    console.log('Database connection error');
    console.log(err);
}); //end mongoose connection error

// handling mongoose success event
mongoose.connection.on('open', function(err) {  // Open event

    if(err) {
        console.log('Database error in opening connection');
        console.log(err)
    } else {
        console.log('Databse connection open success');
    }
}) // end database open connection handler


// listening the server
 //app.listen(appConfig.port, () => {
    
    //console.log('Example app listening on port 3000!');
    //creating the mongodb connection here
    //const db = mongoose.connect(appConfig.db.uri, { useNewUrlParser: true} /*{ useMongoClient: true}*/);
//});