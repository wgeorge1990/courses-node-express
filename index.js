const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(app.get('env'));
// If you want to run on production environment then quit server
// run this is the terminal export NODE_ENV=production and then restart server
// 3rd party middle ware for http safety
app.use(helmet());
// 3rd party MORGAN request logger so only use in development environment
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    console.log('Morgan enabled ==> :)');
}
// app.use(morgan('tiny'));

//Load logger middleware I made
const customMiddleware = require('./customMiddleware');

// Const is uppercase because it is a class
const Joi = require('joi');

// BUILTIN MIDDLEWARE FUNCTIONS IN EXPRESS
// Middleware added for the post request so that we can parse the req body.
app.use(express.json());

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
const courses = [
    {id: 1, name: 'course1'},
    {id: 2, name: 'course2'},
    {id: 3, name: 'course3'}
];

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

// /api/courses/1
app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        res.status(404).send("The course with the given id was not found");
    }
    res.send(course);
});

app.post('/api/courses', (req, res) => {
    //un-factored way of handling validation errors with npm joi. See validateInput() && api/courses POST to see refactored approach.
    const schema = {
        name: Joi.string().min(3).max(8).required()
    };
    const result = Joi.validate(req.body, schema);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
    //Return the new object to the client so that the client can use the new object id.
});

function validateInput(course){
    const schema = {
        name: Joi.string().min(3).max(8).required()
    };
    return Joi.validate(course, schema);
}

app.put('/api/courses/:id', (req, res) => {
    //Look up course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).send("The course with the given id was not found");
    //Using object destructuring to grab just the error attribute off of the result object
    // const result = validateInput(req.body);
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    //update course
    course.name = req.body.name;
    // return updated course
    res.send(course);
});

app.delete('/api/courses/:id', (req, res) => {
    // Look up the course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    // Not existing, return 404
    if (!course){
        res.status(400).send("The course with the given id was not found.");
    }
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    // Delete
    res.send(course);
});


app.get('/api/posts/:year/:month', (req, res) => {
    res.send(req.params);
    res.send(req.query);
});


// PORT -> attempt to read the port of an environment variable first and then revert to port 3000
// To set env on mac enter into terminal:  export PORT=5000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));