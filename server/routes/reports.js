const express = require('express');
const { authenticateToken } = require('../lib/securityFunctions');
const pgClient = require('../lib/postgres');
const router = express.Router();
const PDFDocument = require('pdfkit');

router.post('/reports/getReports', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        console.log(user);

        const userResult = await pgClient.query(
            'SELECT user_id, organization_id FROM users WHERE user_id = $1',
            [user.user_id]
        );

        if (userResult.rows.length === 0) {
            console.log('User not found');
            return res.status(500).json({ error: 'User not found' });
        }

        const userRecord = userResult.rows[0];

        let reportsQuery;
        let queryParams;

        if (userRecord.organization_id === null) {
            reportsQuery = 'SELECT report_id FROM user_reports WHERE user_id = $1';
            queryParams = [userRecord.user_id];
        } else {
            reportsQuery = 'SELECT report_id FROM organization_reports WHERE organization_id = $1';
            queryParams = [userRecord.organization_id];
        }

        const reportIdsResult = await pgClient.query(reportsQuery, queryParams);

        if (reportIdsResult.rows.length === 0) {
            console.log('No reports found');
            return res.status(500).json({ error: 'No reports found' });
        }

        const reportIds = reportIdsResult.rows.map(row => row.report_id);

        if (reportIds.length === 0) {
            console.log('No reports found');
            return res.status(500).json({ error: 'No reports found' });
        }

        const reportsResult = await pgClient.query(
            'SELECT report_id, created_at, content FROM reports WHERE report_id = ANY($1)',
            [reportIds]
        );
        //console.log('Reports fetched successfully');
        //console.log(reportsResult.rows);

        let reports = reportsResult.rows.map(report => {
            const content = report.content.reports; // Accessing the 'reports' array within the content object
            //console.log("Report Content:", content); // Log the entire content to see its structure
            let criticalCount = 0;
            let mediumCount = 0;
            let lowCount = 0;

            content.forEach(reportItem => {
                reportItem.forEach(item => {
                    //console.log("Item:", item); // Log the entire item to examine its structure
                    let severity = item.Severity || item.severity; // Check for both 'Severity' and 'severity'

                    // Ensure that the severity is trimmed and in a consistent case
                    if (severity) {
                        severity = severity.trim().toLowerCase();
                    }
                    
                    console.log("Item Severity:", severity); // Log the severity to see what it returns

                    switch (severity) {
                        case 'high':
                            criticalCount++;
                            break;
                        case 'medium':
                            mediumCount++;
                            break;
                        case 'low':
                            lowCount++;
                            break;
                        default:
                            console.log("Unknown severity:", severity); // Log any severity that doesn't match expected values
                            break;
                    }
                });
            });

            return {
                report_id: report.report_id,
                created_at: report.created_at, // Include the creation date of the report
                criticalCount,
                mediumCount,
                lowCount
            };
        });

        console.log(reports);
        res.json({ reports });
        
    } catch (error) {
        console.error('Error fetching reports:', error);
        return res.status(500).json({ error: 'An error occurred while fetching reports' });
    }
});

router.get('/reports/executive/:report_id', authenticateToken, async (req, res) => {
    try {
        const { report_id } = req.params;

        // Fetch the report data by ID
        const reportResult = await pgClient.query(
            'SELECT report_id, created_at, content FROM reports WHERE report_id = $1',
            [report_id]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const report = reportResult.rows[0];
        const content = report.content.reports;

        // Initialize counts for trends
        let criticalCount = 0;
        let mediumCount = 0;
        let lowCount = 0;

        content.forEach(reportItem => {
            reportItem.forEach(item => {
                let severity = item.Severity || item.severity;
                if (severity) severity = severity.trim().toLowerCase();

                switch (severity) {
                    case 'high':
                        criticalCount++;
                        break;
                    case 'medium':
                        mediumCount++;
                        break;
                    case 'low':
                        lowCount++;
                        break;
                    default:
                        break;
                }
            });
        });

        // Create a PDF document
        const doc = new PDFDocument();
        let filename = `executive_report_${report_id}.pdf`;
        filename = encodeURIComponent(filename) + '.pdf';
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF into the response
        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(20).text('Executive Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Report ID: ${report.report_id}`);
        doc.text(`Date Created: ${new Date(report.created_at).toLocaleDateString()}`);
        doc.moveDown();
        doc.text(`Critical Issues: ${criticalCount}`);
        doc.text(`Medium Issues: ${mediumCount}`);
        doc.text(`Low Issues: ${lowCount}`);
        doc.moveDown();

        // Add any other summary or trend information you want here

        // Finalize the PDF and end the response
        doc.end();
        
    } catch (error) {
        console.error('Error generating executive report:', error);
        return res.status(500).json({ error: 'An error occurred while generating the report' });
    }
});

module.exports = router;