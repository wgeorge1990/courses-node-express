const express = require('express');
const Joi = require('joi');
const router = express.Router();
// Const is uppercase because it is a class

// BUILTIN MIDDLEWARE FUNCTIONS IN EXPRESS
// Middleware added for the post request so that we can parse the req body.
// In refactor this line of code had to be moved to this file and then called on router instead of app.
router.use(express.json());

function validateInput(course){
    const schema = {
        name: Joi.string().min(3).max(8).required()
    };
    return Joi.validate(course, schema);
}

const courses = [
    {id: 1, name: 'course1'},
    {id: 2, name: 'course2'},
    {id: 3, name: 'course3'}
];

router.get('/', (req, res) => {
    res.send(courses);
});

// /api/courses/1
router.get('/:id', (req, res) => {
    const course = courses.find(c => c.id === parseInt(req.params.id));
    if (!course) {
        res.status(404).send("The course with the given id was not found");
    }
    res.send(course);
});

router.post('/', (req, res) => {
    //un-factored way of handling validation errors with npm joi. See validateInput() && api/courses POST to see refactored approach.
    const schema = {
        name: Joi.string().min(3).max(8).required()
    };
    const result = Joi.validate(req.body, schema);
    if (result.error) return res.status(400).send(result.error.details[0].message);
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
    //Return the new object to the client so that the client can use the new object id.
});

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
    // Look up the course
    const course = courses.find(c => c.id === parseInt(req.params.id));
    // Not existing, return 404
    if (!course) return res.status(400).send("The course with the given id was not found.");
    const index = courses.indexOf(course);
    courses.splice(index, 1);
    // Delete
    res.send(course);
});

module.exports = router;