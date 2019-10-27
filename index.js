const debug = require('debug')('app:startup');
const config = require('config');
const express = require('express');
const app = express();
// Refactored courses and home routes into individual router modules.
const courses = require('./routes/courses');
const home = require('./routes/home');

const helmet = require('helmet');
const morgan = require('morgan');

//now that we have broken out the courses routes into their own module and exported them as a router
// We need to tell express when and where to look for these routes in our app.
app.use('/api/courses', courses);
app.use('/', home);

// Config folder and configuration file
console.log("application name:", config.get('name'));
console.log("application name:", config.get('mail.host'));
console.log("Mail password: ", config.get('mail.password'));

// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
// console.log(app.get('env'));
// If you want to run on production environment then quit server
// run this is the terminal export NODE_ENV=production and then restart server
// 3rd party middle ware for http safety
app.use(helmet());
// 3rd party MORGAN request logger so only use in development environment
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    // console.log('Morgan enabled ==> :)');
    debug('Morgan enabled from debug module...');
    // to use export DEBUG=app:startup
    // OR skip having to export env by running DEBUG=app:startup nodemon index.js
    // Kill a port process on mac :  kill $(lsof -t -i :3000)
}
// debug('starting debug module...');
// app.use(morgan('tiny'));

//Load logger middleware I made
const customMiddleware = require('./customMiddleware');

//parses x-www-form-urlencoded into req.body object
app.use(express.urlencoded({extended: true}));

//This is where you hold all static files and allow them to be served from the root of the project
// to visit localhost:5000/readme.txt
app.use(express.static('public'));

// Below I am going to create my own middle ware function that is used in the request pipeline. If I dont call next
// at the last line of the function then I will hang the function in the process. It will get stuck and not finish.
// app.use(function(req, res, next){
//     console.log("Custom Logging Middleware", "Request Body: ");
//     next();
// });
// Code is commented out because this logging function was refactored into it own file called
// logger.js, defined as a function called log, exported through module as log, then imported into
// index.js as const logger, and then set to be used in response pipeline by calling app.use(logger);
app.use(customMiddleware.log);

// app.use(function(req, res, next){
//     console.log("Authentication");
//     next();
// });
// Refactored auth middleware as will and moved to customMiddleware.js and imported as authentication
app.use(customMiddleware.authentication);

// PORT -> attempt to read the port of an environment variable first and then revert to port 3000
// To set env on mac enter into terminal:  export PORT=5000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));