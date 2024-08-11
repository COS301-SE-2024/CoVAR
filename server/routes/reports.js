const express = require('express');
const { authenticateToken } = require('../lib/securityFunctions');
const pgClient = require('../lib/postgres');
const router = express.Router();
const PDFDocument = require('pdfkit');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

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
const width = 800; // Width of the canvas
const height = 600; // Height of the canvas
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
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

        // Extract the client's name and creation date from the report
        const clientName = report.title || 'UnknownClient';
        const reportCreationDate = new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const clientReports = reportResult.rows;

       
        // Initialize counters and unique host sets
        let ReportscriticalCount = 0, ReportsmediumCount = 0, ReportslowCount = 0;
        let criticalHosts = new Set(), mediumHosts = new Set(), lowHosts = new Set();

        let reports = reportResult.rows.map(report => {
            const content = report.content.reports;

            content.forEach(reportItem => {
                reportItem.forEach(item => {
                    let severity = item.Severity || item.severity;
                    let hostIdentifier = `${item.IP}:${item.Port}`; // Unique identifier for the host

                    if (severity) {
                        severity = severity.trim().toLowerCase();
                    }

                    switch (severity) {
                        case 'high':
                            ReportscriticalCount++;
                            criticalHosts.add(hostIdentifier); // Add to critical hosts set
                            break;
                        case 'medium':
                            ReportsmediumCount++;
                            mediumHosts.add(hostIdentifier); // Add to medium hosts set
                            break;
                        case 'low':
                            ReportslowCount++;
                            lowHosts.add(hostIdentifier); // Add to low hosts set
                            break;
                        default:
                            console.log("Unknown severity:", severity);
                            break;
                    }
                });
            });
        });

        // Count unique hosts for each severity
        let uniqueCriticalHostsCount = criticalHosts.size;
        let uniqueMediumHostsCount = mediumHosts.size;
        let uniqueLowHostsCount = lowHosts.size;

        // console.log("Unique Critical Hosts:", uniqueCriticalHostsCount);
        // console.log("Unique Medium Hosts:", uniqueMediumHostsCount);
        // console.log("Unique Low Hosts:", uniqueLowHostsCount);
         // Initialize counts
         let criticalCount = 0;
         let mediumCount = 0;
         let lowCount = 0;
         //getting data for graph
         //check if org or user
         const userResult = await pgClient.query(
             'SELECT user_id, organization_id FROM users WHERE user_id = $1',
             [req.user.user_id]
         );
         if (userResult.rows[0].organization_id === null) {
            // Select all reports from the database associated with the user that are earlier than the current report
            const reportsResult = await pgClient.query(
                `SELECT report_id, created_at, content 
                 FROM reports 
                 WHERE DATE_TRUNC('minute', created_at) <= DATE_TRUNC('minute', $1::timestamp)
                 AND report_id = ANY(
                     SELECT report_id FROM user_reports WHERE user_id = $2
                 )
                 ORDER BY created_at ASC`,
                [new Date(report.created_at).toISOString(), req.user.user_id] // Convert date to ISO string for proper casting
            );
            console.log('report created at', report.created_at);
            graphData = reportsResult.rows;
            console.log('graph data', graphData);
        }else{
            // Select all reports from the database associated with the organization that are earlier than the current report
            const reportsResult = await pgClient.query(
                `SELECT report_id, created_at, content 
                 FROM reports 
                 WHERE DATE_TRUNC('minute', created_at) <= DATE_TRUNC('minute', $1::timestamp)
                 AND report_id = ANY(
                    SELECT report_id FROM organization_reports WHERE organization_id = $2
                 )
                 ORDER BY created_at ASC`,
                [new Date(report.created_at).toISOString(), userResult.rows[0].organization_id] // Convert date to ISO string for proper casting
            );
            graphData = reportsResult.rows;
            console.log('graph data', graphData);
        }
        // Prepare data for trend graph
        const trendData = graphData.map((report) => {
            let currentCriticalCount = 0;
            let currentMediumCount = 0;
            let currentLowCount = 0;
        
            // Process each report to count the vulnerabilities
            report.content.reports.forEach((reportItem) => {
                reportItem.forEach((item) => {
                    let severity = item.Severity || item.severity;
                    if (severity) severity = severity.trim().toLowerCase();
        
                    switch (severity) {
                        case 'high':
                            currentCriticalCount++;
                            break;
                        case 'medium':
                            currentMediumCount++;
                            break;
                        case 'low':
                            currentLowCount++;
                            break;
                        default:
                            break;
                    }
                });
            });
        
            // Accumulate counts for the summary table
            criticalCount += currentCriticalCount;
            mediumCount += currentMediumCount;
            lowCount += currentLowCount;
        
            return {
                date: new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                criticalCount: currentCriticalCount,
                mediumCount: currentMediumCount,
                lowCount: currentLowCount,
            };
        });
        console.log('trend data',trendData);
        // Generate trend graph using chart.js-node-canvas
        const labels = trendData.map((data) => data.date);
        const criticalCounts = trendData.map((data) => data.criticalCount);
        const mediumCounts = trendData.map((data) => data.mediumCount);
        const lowCounts = trendData.map((data) => data.lowCount);
        
        const configuration = {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Critical',
                        data: criticalCounts,
                        borderColor: 'red',
                        fill: false,
                    },
                    {
                        label: 'Medium',
                        data: mediumCounts,
                        borderColor: 'orange',
                        fill: false,
                    },
                    {
                        label: 'Low',
                        data: lowCounts,
                        borderColor: 'green',
                        fill: false,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Affected Hosts',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                        },
                    },
                },
            },
        };

        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            autoFirstPage: false  // Don't create a page automatically
        });

        const totalVulnerabilities = criticalCount + mediumCount + lowCount;

        // Construct the filename using the client name and report creation date
        const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize client name to avoid illegal characters in filename
        let filename = `CoVarExecutive-${sanitizedClientName}-${reportCreationDate}.pdf`;
        filename = encodeURIComponent(filename);
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        // Pipe the PDF into the response
        doc.pipe(res);

        // Use the report's creation date for headers and footers
        const creationDate = new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        // Add the cover page
        doc.addPage();

        // Add the image
        const imagePath = path.join(__dirname, '../routes/assets/4546131_3922.jpg');
        doc.image(imagePath, { fit: [500, 500], align: 'center', valign: 'center' });
        doc.moveDown(40);

        // Add a solid blue background behind the title
        doc.rect(50, doc.y, 500, 70).fill('darkblue');

        // Add the title on top of the blue background
        doc.fontSize(24).fillColor('white').text('Cyber Security Vulnerability Report', 60, doc.y, {
            align: 'left',
        });

        // Add the report creation date
        doc.text(reportCreationDate, 60, doc.y + 10, { align: 'left' });

        // Add a solid gray background behind the subtitle
        doc.rect(50, doc.y, 500, 30).fill('gray');

        // Add the subtitle on top of the gray background
        doc.fontSize(12).fillColor('white').text('BlueVision ITM (Pty) Limited', 60, doc.y + 10, {
            align: 'left',
        });

        // Add the footer on the cover page
        doc.moveDown(4);
        doc.fontSize(8).fillColor('gray').text(`Disclosure Classification: Confidential`, { align: 'left' });
        doc.text(`2022 Revision: 1.0`, { align: 'right' });

        // Function to add header and footer to each page
        const addHeader = () => {
            doc.fontSize(10).text(`Cyber Security Vulnerability Report ${creationDate}`, 50, 40);
            doc.text(`BlueVision ITM (Pty) Limited`, { align: 'right' });
            doc.moveDown();
        };

        const addFooter = () => {
            doc.fontSize(8).fillColor('gray').text(`Cyber Security Vulnerability Report ${creationDate} Revision: 1.0`, 50, doc.page.height - 90);
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

        // Add the Vulnerability Summary Table
        doc.fontSize(14).text('Vulnerability Summary', { align: 'left' });
        doc.moveDown(0.5);

        // Define table dimensions and position
        const tableTop = doc.y;
        const tableLeft = 50;
        const tableWidth = 500;
        const cellPadding = 5;
        const columnWidths = [150, 175, 175];
        const rowHeight = 25;

        // Draw table header background
        doc.rect(tableLeft, tableTop, tableWidth, rowHeight).fillAndStroke('darkblue', 'black');

        // Draw column titles
        doc.fillColor('white').fontSize(10).text('Threat', tableLeft + cellPadding, tableTop + cellPadding, { width: columnWidths[0], align: 'center' });
        doc.text('Vulnerability number', tableLeft + columnWidths[0] + cellPadding, tableTop + cellPadding, { width: columnWidths[1], align: 'center' });
        doc.text('Affected hosts', tableLeft + columnWidths[0] + columnWidths[1] + cellPadding, tableTop + cellPadding, { width: columnWidths[2], align: 'center' });

        // Reset fill color for rows
        doc.fillColor('black');

        // Helper function to draw rows
        const drawRow = (y, label, vulNumber, affectedHosts) => {
            doc.rect(tableLeft, y, columnWidths[0], rowHeight).stroke();
            doc.rect(tableLeft + columnWidths[0], y, columnWidths[1], rowHeight).stroke();
            doc.rect(tableLeft + columnWidths[0] + columnWidths[1], y, columnWidths[2], rowHeight).stroke();

            doc.text(label, tableLeft + cellPadding, y + cellPadding, { width: columnWidths[0], align: 'center' });
            doc.text(vulNumber.toString(), tableLeft + columnWidths[0] + cellPadding, y + cellPadding, { width: columnWidths[1], align: 'center' });
            doc.text(affectedHosts.toString(), tableLeft + columnWidths[0] + columnWidths[1] + cellPadding, y + cellPadding, { width: columnWidths[2], align: 'center' });
        };

        // Draw each row
        drawRow(tableTop + rowHeight, 'Critical', ReportscriticalCount, uniqueCriticalHostsCount);
        drawRow(tableTop + rowHeight * 2, 'Medium', ReportsmediumCount, uniqueMediumHostsCount);
        drawRow(tableTop + rowHeight * 3, 'Low', ReportslowCount, uniqueLowHostsCount);

        // Draw total row directly below the other rows
const totalRowY = tableTop + rowHeight * 4;
doc.rect(totalRowY, tableLeft, tableWidth, rowHeight).fillAndStroke('darkblue', 'black');
doc.fillColor('white').text('Total', tableLeft + cellPadding, totalRowY + cellPadding, { width: columnWidths[0], align: 'center' });
doc.text((ReportscriticalCount + ReportsmediumCount + ReportslowCount).toString(), tableLeft + columnWidths[0] + cellPadding, totalRowY + cellPadding, { width: columnWidths[1], align: 'center' });
doc.text((uniqueCriticalHostsCount + uniqueMediumHostsCount + uniqueLowHostsCount).toString(), tableLeft + columnWidths[0] + columnWidths[1] + cellPadding, totalRowY + cellPadding, { width: columnWidths[2], align: 'center' });

        // Add any other content here...
        addFooter();
        doc.moveDown();

        // Add the trend graph
        // addNewPage();
        doc.fontSize(16).text('Trend Graph', { align: 'center' });
        doc.moveDown(2);

        // Embed the trend graph image in the PDF
        doc.image(imageBuffer, {
            fit: [500, 300],
            align: 'center',
            valign: 'center'
        });

        // Finalize the PDF and send it
        doc.end();

    } catch (error) {
        console.error('Error generating executive report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
const truncateToSecond = (date) => {
    const newDate = new Date(date);
    newDate.setMilliseconds(0);
    return newDate.toISOString();;
};

module.exports = router;