const express = require('express');
const { authenticateToken } = require('../lib/securityFunctions');
const pgClient = require('../lib/postgres');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;

        // Fetch user by user_id
        const userResult = await pgClient.query(
            'SELECT user_id, organization_id FROM users WHERE user_id = $1',
            [user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userRecord = userResult.rows[0];

        let reportsQuery;
        let queryParams;

        if (userRecord.organization_id === null) {
            // Fetch all report_ids related to the user_id in the user_reports table
            reportsQuery = 'SELECT report_id FROM user_reports WHERE user_id = $1';
            queryParams = [userRecord.user_id];
        } else {
            // Fetch all report_ids related to the organization_id in the organization_reports table
            reportsQuery = 'SELECT report_id FROM organization_reports WHERE organization_id = $1';
            queryParams = [userRecord.organization_id];
        }

        const reportIdsResult = await pgClient.query(reportsQuery, queryParams);

        if (reportIdsResult.rows.length === 0) {
            return res.status(404).json({ error: 'No reports found' });
        }

        const reportIds = reportIdsResult.rows.map(row => row.report_id);

        // Fetch the reports from the report table using the collected report_ids
        const reportsResult = await pgClient.query(
            'SELECT * FROM reports WHERE report_id = ANY($1)',
            [reportIds]
        );
        console.log('Reports:', reportsResult.rows);
        return res.status(200).json({ reports: reportsResult.rows });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return res.status(500).json({ error: 'An error occurred while fetching reports' });
    }
});

module.exports = router;
