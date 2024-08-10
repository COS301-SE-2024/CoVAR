const express = require('express');
const { authenticateToken } = require('../lib/securityFunctions');
const pgClient = require('../lib/postgres');
const router = express.Router();
const PDFDocument = require('pdfkit');
const path = require('path');

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
                    
                    //console.log("Item Severity:", severity); // Log the severity to see what it returns

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

        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            autoFirstPage: false  // Don't create a page automatically
        });

        let filename = `executive_report_${report_id}.pdf`;
        filename = encodeURIComponent(filename) + '.pdf';
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF into the response
        doc.pipe(res);

        // Get today's date for header and footer
        const todayDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        // Add the cover page
        doc.addPage();

        // Add the image
        const imagePath = path.join(__dirname, '../routes/assets/4546131_3922.jpg');
        doc.image(imagePath, { fit: [500, 500], align: 'center', valign: 'center' });
        doc.moveDown(40);
        // Add a solid blue background behind the title
        doc.rect(50, doc.y, 500, 65) // Adjust dimensions and position as needed
        .fill('darkblue'); // Fill with blue color

        // Add the title on top of the blue background
        doc.fontSize(24).fillColor('white').text('Cyber Security Vulnerability Report January 2023', 60, doc.y + 10, {
            align: 'left',
        });
        // Add a solid blue background behind the subtitle
        doc.rect(50, doc.y, 500, 30) // Adjust dimensions and position as needed
        .fill('gray'); // Fill with blue color

        // Add the subtitle on top of the blue background
        doc.fontSize(12).fillColor('white').text('BlueVision ITM (Pty) Limited', 60, doc.y + 10, {
            align: 'left',
        });

        // Add the footer on the cover page
        doc.moveDown(4);
        doc.fontSize(8).fillColor('gray').text(`Disclosure Classification: Confidential`, { align: 'left' });
        doc.text(`2022 Revision: 1.0`, { align: 'right' });

        // Function to add header and footer to each page
        const addHeader = () => {
            doc.fontSize(10).text(`Cyber Security Vulnerability Report ${todayDate}`, 50, 40);
            doc.text(`BlueVision ITM (Pty) Limited`, { align: 'right' });
            doc.moveDown();
        };

        const addFooter = () => {
            doc.fontSize(8).fillColor('gray').text(`Cyber Security Vulnerability Report ${todayDate} Revision: 1.0`, 50, doc.page.height - 90);
            doc.text(`Disclosure Classification: Confidential`);
            doc.text(`© Copyright BlueVision ITM (PTY) Limited – All Rights Reserved.`);
            doc.text(`Page ${doc.pageNumber}`, { align: 'right' });
        };

        // Function to add a new page with header and footer
        const addNewPage = () => {
            if (doc.pageNumber > 0) {
                addFooter();
                doc.addPage();
            } else {
                doc.addPage();
            }
            addHeader();
        };

        // Add the first content page
        addNewPage();

        // Add content to the PDF
        doc.fontSize(20).text('Executive Report', { align: 'center' });
        doc.moveDown();
        doc.text(`Date Created: ${new Date(report.created_at).toLocaleDateString()}`);
        doc.moveDown();
        // Vulnerability Manager Section
        doc.fontSize(18).fillColor('black').text('Vulnerability Manager', { align: 'left' });
        doc.fontSize(12).text('Greenbone Vulnerability Manager is proprietary software used to perform vulnerability scans on network devices. Greenbone Vulnerability Manager is used for all Andile Solutions vulnerability scanning.', { align: 'left' });
        // Risk Profile Section
        doc.fontSize(18).text('Risk Profile', { align: 'left' });
        doc.fontSize(12).text('A system’s risk profile is constructed by considering the results by severity class of all known common vulnerabilities. The information below respectively shows the system’s risk profile of the number of affected hosts by severity class as well as vulnerability per identified category.', { align: 'left' });
        doc.moveDown();
        // Vulnerability Summary Table for December 2022
        doc.fontSize(14).text('Vulnerability Summary', { align: 'left' });
        doc.fontSize(12).text('Table 1 Vulnerability Summary – December 2022', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text('VULNERABILITY SUMMARY', { align: 'center', underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Threat                  Vulnerability number                  Affected hosts
            Critical                  ${criticalCount}                                             6
            Medium                      ${mediumCount}                                            4
            Low                 ${lowCount}                                           68
            Total                     ${mediumCount+criticalCount+lowCount}                                            78`, { align: 'left', lineGap: 3 });
            
        doc.moveDown(2);

        // Add any other content here...

        // Finalize the footer on the last page
        addFooter();

        // Finalize the PDF and end the response
        doc.end();

    } catch (error) {
        console.error('Error generating executive report:', error);
        return res.status(500).json({ error: 'An error occurred while generating the report' });
    }
});

module.exports = router;