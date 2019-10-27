const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World you are on the homepage!!! now checkout the api/courses routes');
});

module.exports = router;
