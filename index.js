const express = require('express');
const app = express();

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
    if (!req.body.name || req.body.name.length < 3) {
        // 400 bad request
        res.status(400).send("Name is required and must be more than three characters.");
    }
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
    //Return the new object to the client so that the client can use the new object id.
});

app.get('/api/posts/:year/:month', (req, res) => {
    res.send(req.params);
    res.send(req.query);
});


// PORT -> attempt to read the port of an enviornment variable first and then revert to port 3000
// To set env on mac enter into terminal:  export PORT=5000
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
