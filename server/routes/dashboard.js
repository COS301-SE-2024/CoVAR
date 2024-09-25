const express = require('express');
const { authenticateToken } = require('../lib/securityFunctions');
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

// Route to get the last report date for each client or organization
router.get('/reports/last_report_dates', authenticateToken, async (req, res) => {

    try {
        // Query to get last report date for assigned clients
        const clientReports = await pgClient.query(
            `SELECT u.username AS client_name, MAX(r.created_at) AS last_report_date
            FROM users u
            JOIN user_reports ur ON u.user_id = ur.user_id
            JOIN reports r ON ur.report_id = r.report_id
            WHERE u.role = 'client'
            GROUP BY u.username`
        );

        // Query to get last report date for assigned organizations
        const organizationReports = await pgClient.query(
            `SELECT o.name AS organization_name, MAX(r.created_at) AS last_report_date
            FROM organizations o
            JOIN organization_reports orp ON o.organization_id = orp.organization_id
            JOIN reports r ON orp.report_id = r.report_id
            GROUP BY o.name`
        );

        const result = {
            clients: clientReports.rows,
            organizations: organizationReports.rows
        };

        res.send(result);
    } catch (err) {
        console.error('Error fetching last report dates:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
