const express = require('express');
const { authenticateToken, verifyToken } = require('../lib/securityFunctions');
const pgClient = require('../lib/postgres');
const router = express.Router();
const { getAllReportIds } = require('../lib/serverHelperFunctions'); 

// Return all reports for the user / organization if they are in one
router.get('/reports/all', authenticateToken, async (req, res) => {
    const userId = req.user.user_id;

    try {
        const reportIds = await getAllReportIds(pgClient, userId);
        const reports = await pgClient.query('SELECT * FROM reports WHERE report_id = ANY($1) ORDER BY created_at DESC', [reportIds]);
        res.send(reports.rows);
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
