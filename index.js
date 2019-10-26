const express = require('express');
const app = express();

// Const is uppercase because it is a class
const Joi = require('joi');

// Middleware added for the post request so that we can parse the req body.
app.use(express.json());

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
    if (!course) {
        res.status(404).send("The course with the given id was not found");
    }
    //Using object destructuring to grab just the error attribute off of the result object
    // const result = validateInput(req.body);
    const { error } = validateInput(req.body);

    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
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
