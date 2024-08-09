const express = require('express');
const { authenticateToken, verifyToken } = require('../lib/securityFunctions');
const pgClient = require('../lib/postgres');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
    //  access reports from db and return them to the user
    pgClient.query('SELECT * FROM reports', (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error fetching reports');
        } else {
            res.send(result.rows);
        }
    });
});

module.exports = router;
