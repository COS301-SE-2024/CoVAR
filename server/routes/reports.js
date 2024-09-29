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
        

        const userResult = await pgClient.query(
            'SELECT user_id, organization_id FROM users WHERE user_id = $1',
            [user.user_id]
        );

        if (userResult.rows.length === 0) {
            
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
            
            return res.status(500).json({ error: 'No reports found' });
        }

        const reportIds = reportIdsResult.rows.map(row => row.report_id);

        if (reportIds.length === 0) {
            
            return res.status(500).json({ error: 'No reports found' });
        }

        const reportsResult = await pgClient.query(
            'SELECT report_id, created_at, content FROM reports WHERE report_id = ANY($1)',
            [reportIds]
        );
        

        
        let reports = reportsResult.rows.map(report => {
            const content = report.content.finalReport; // Accessing the 'reports' array within the content object
            let criticalCount = 0;
            let mediumCount = 0;
            let lowCount = 0;

            content.forEach(reportItem => {

                
                let severity = reportItem.Severity || reportItem.severity; // Check for both 'Severity' and 'severity'

                // Ensure that the severity is trimmed and in a consistent case
                if (severity) {
                    severity = severity.trim().toLowerCase();
                }

                

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

            return {
                report_id: report.report_id,
                created_at: report.created_at, // Include the creation date of the report
                criticalCount,
                mediumCount,
                lowCount
            };
        });
        res.json({ reports });

    } catch (error) {
        console.error('Error fetching reports:', error);
        return res.status(500).json({ error: 'An error occurred while fetching reports' });
    }
});

router.post('/reports/getReportsPerClient', authenticateToken, async (req, res) => {
    try {
        const user = req.user; // Get the logged-in VA user

        // Query to get the clients assigned to the logged-in VA
        const assignedClientsQuery = `
            SELECT u.user_id, u.username 
            FROM assignment a
            INNER JOIN users u ON a.client = u.user_id
            WHERE a.va = $1
        `;
        const assignedClientsResult = await pgClient.query(assignedClientsQuery, [user.user_id]);

        if (assignedClientsResult.rows.length === 0) {
            return res.status(404).json({ error: 'No assigned clients found' });
        }

        const assignedClients = assignedClientsResult.rows;

        // Initialize an array to store the number of reports per client
        const reportsPerClient = [];

        // Loop through each assigned client and get the number of reports for each
        for (let client of assignedClients) {
            const clientReportsQuery = `
                SELECT COUNT(ur.report_id) AS report_count
                FROM user_reports ur
                WHERE ur.user_id = $1
            `;
            const clientReportsResult = await pgClient.query(clientReportsQuery, [client.user_id]);

            const reportCount = clientReportsResult.rows[0]?.report_count || 0;

            // Push the result into the reportsPerClient array
            reportsPerClient.push({
                client_id: client.user_id,
                client_name: client.username,
                report_count: reportCount
            });
        }

        // Send the results as the response
        return res.status(200).json(reportsPerClient);
    } catch (err) {
        console.error('Error fetching reports per client:', err);
        return res.status(500).json({ error: 'An error occurred while fetching reports per client' });
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

        // Extract the client's name and creation date from the report
        const clientName = report.title || 'UnknownClient';
        const reportCreationDate = new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Initialize counters and unique host sets
        let ReportscriticalCount = 0, ReportsmediumCount = 0, ReportslowCount = 0;
        let criticalHosts = new Set(), mediumHosts = new Set(), lowHosts = new Set();

        // Initialize sets to track unique vulnerabilities
        let criticalVulnerabilities = new Set(), mediumVulnerabilities = new Set(), lowVulnerabilities = new Set();
        let vulnerabilityCategories = new Map();
        let aggregatedVulnerabilities = new Map();
        const reports = reportResult.rows.map(report => {
            const content = report.content.finalReport;

            content.forEach(reportItem => {

                let severity = reportItem.Severity || reportItem.severity;
                let hostIdentifier = `${reportItem.IP}:${reportItem.Port}`; // Unique identifier for the host
                let vulnerabilityIdentifier = reportItem.nvtName;
                let cvssScore = reportItem.CVSS;
                if (vulnerabilityIdentifier && cvssScore) {
                    if (aggregatedVulnerabilities.has(vulnerabilityIdentifier)) {
                        let existingEntry = aggregatedVulnerabilities.get(vulnerabilityIdentifier);
                        existingEntry.hosts.push(hostIdentifier);
                    } else {
                        // Otherwise, create a new entry
                        aggregatedVulnerabilities.set(vulnerabilityIdentifier, {
                            vulnerability: vulnerabilityIdentifier,
                            cvss: cvssScore,
                            hosts: [hostIdentifier]
                        });
                    }
                }
                if (vulnerabilityIdentifier) {
                    if (!vulnerabilityCategories.has(vulnerabilityIdentifier)) {
                        vulnerabilityCategories.set(vulnerabilityIdentifier, 1);
                    } else {
                        vulnerabilityCategories.set(vulnerabilityIdentifier, vulnerabilityCategories.get(vulnerabilityIdentifier) + 1);
                    }
                }
                if (severity) {
                    severity = severity.trim().toLowerCase();
                }

                switch (severity) {
                    case 'high':
                        ReportscriticalCount++;
                        criticalHosts.add(hostIdentifier); // Add to critical hosts set
                        criticalVulnerabilities.add(vulnerabilityIdentifier); // Add to critical vulnerabilities set
                        break;
                    case 'medium':
                        ReportsmediumCount++;
                        mediumHosts.add(hostIdentifier); // Add to medium hosts set
                        mediumVulnerabilities.add(vulnerabilityIdentifier); // Add to medium vulnerabilities set
                        break;
                    case 'low':
                        ReportslowCount++;
                        lowHosts.add(hostIdentifier); // Add to low hosts set
                        lowVulnerabilities.add(vulnerabilityIdentifier); // Add to low vulnerabilities set
                        break;
                    default:
                        break;
                }

            });
        });
        if (reports.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        // Count unique hosts for each severity
        let uniqueCriticalHostsCount = criticalHosts.size;
        let uniqueMediumHostsCount = mediumHosts.size;
        let uniqueLowHostsCount = lowHosts.size;

        // Convert the Map to an array of categories and their counts
        const vulnerabilityTypes = Array.from(vulnerabilityCategories.keys());
        const vulnerabilityCounts = Array.from(vulnerabilityCategories.values());
        // Initialize counts
        let criticalCount = 0;
        let mediumCount = 0;
        let lowCount = 0;
        //pie chart data 
        // Prepare data for pie chart
        // Helper function to check if a color is too light (like white or near white)
        function isLightColor(color) {
            // Convert the hex color to RGB
            const r = parseInt(color.substring(1, 3), 16);
            const g = parseInt(color.substring(1, 3), 16);
            const b = parseInt(color.substring(1, 3), 16);

            // Calculate brightness (a simplistic approach)
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            // Return true if the color is too light
            return brightness > 230; // Adjust this value as needed
        }
        const pieChartData = {
            labels: vulnerabilityTypes,
            datasets: [{
                data: vulnerabilityCounts,
                backgroundColor: vulnerabilityTypes.map(() => {
                    let color;
                    do {
                        color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                    } while (isLightColor(color)); // Regenerate color if it's too light
                    return color;
                })
            }]
        };
        // Create the pie chart configuration
        const pieChartConfig = {
            type: 'pie',
            data: pieChartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',  // Move legend to the bottom
                        labels: {
                            font: {
                                size: 10  // Decrease the font size of the legend
                            },
                            boxWidth: 10,  // Adjust the box width to fit better
                            padding: 10,  // Add padding between legend items
                        },
                    },
                },
            },
        };
        // Generate the pie chart image
        const pieChartBuffer = await chartJSNodeCanvas.renderToBuffer(pieChartConfig);

        //getting data for graph
        //check if org or user
        const userResult = await pgClient.query(
            'SELECT user_id, organization_id FROM users WHERE user_id = $1',
            [req.user.user_id]
        );
        let graphData = [];
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
            graphData = reportsResult.rows;
        } else {
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
        }
        // Prepare data for trend graph
        const trendData = graphData.map((report) => {
            let currentCriticalCount = 0;
            let currentMediumCount = 0;
            let currentLowCount = 0;

            // Process each report to count the vulnerabilities
            report.content.finalReport.forEach((reportItem) => {
                let severity = reportItem.Severity || reportItem.severity;
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

            // Accumulate counts for the summary table
            criticalCount = currentCriticalCount + criticalCount;
            mediumCount = currentMediumCount + mediumCount;
            lowCount = currentLowCount + lowCount;

            return {
                date: new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                criticalCount: currentCriticalCount,
                mediumCount: currentMediumCount,
                lowCount: currentLowCount,
            };
        });
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
        doc.moveDown(35);

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
        const disclosureText = `Disclosure Classification: Confidential`;
        const revisionText = `${creationDate} Revision: 1.0`;

        const pageWidth = doc.page.width; // Get the width of the page
        const revisionX = pageWidth - doc.widthOfString(revisionText) - 20; // Calculate X position for right alignment with some padding

        // Write the disclosure text
        doc.fontSize(8).fillColor('gray').text(disclosureText, { align: 'left' });

        // Write the revision text at calculated position
        doc.text(revisionText, revisionX, doc.y, { align: 'left' }); // Keep align as left since we are positioning it manually


        const addHeader = () => {
            const leftText = `Cyber Security Vulnerability Report ${creationDate}`;
            const rightText = `BlueVision ITM (Pty) Limited`;

            // Draw the left text aligned to the left side
            doc.fontSize(10).text(leftText, 50, 40, {
                width: doc.page.width / 2 - 50, // Leave space for the right text
                align: 'left'
            });

            // Draw the right text aligned to the right side
            doc.fontSize(10).text(rightText, 0, 40, {
                width: doc.page.width - 100,  // Ensures padding on both sides
                align: 'right'
            });
        };
        
        let pagenumber = 1;
        const addFooter = () => {
            const footerText = `Cyber Security Vulnerability Report ${creationDate} Revision: 1.0 | Disclosure Classification: Confidential | © Copyright BlueVision ITM (PTY) Limited – All Rights Reserved. | Page ${pagenumber++}`;
            doc.fontSize(8).fillColor('gray').text(footerText, 50, doc.page.height - 90, {
                width: doc.page.width - 100, // Leaves some padding on both sides
                align: 'center' // Center align the footer text
            });
        };

        const addNewPage = () => {
            if (pagenumber > 0) {          
                addFooter(); 
            }
            doc.addPage(); 
            addHeader();    
            doc.y = 50; // Reset the vertical position to the top of the page
        }

        // Add the first content page
        addNewPage();

        // Add content to the PDF
        doc.moveDown();
        doc.moveDown();
        doc.fontSize(20).text('Executive Report', { align: 'center' });
        doc.moveDown();
        // Date Created Section
        doc.text(`Date Created: ${new Date(report.created_at).toLocaleDateString()}`, { indent: 20 }); // Move Date Created slightly to the right
        doc.moveDown();

        // Vulnerability Manager Section
        doc.fontSize(18).fillColor('black').text('Vulnerability Manager', { align: 'left', indent: 20 }); // Move slightly to the right with indent
        doc.fontSize(12).text(
            'Greenbone Vulnerability Manager is proprietary software used to perform vulnerability scans on ', 
            { align: 'left', indent: 20, paragraphIndent: 20 } // Apply indent and paragraphIndent to wrap the text correctly
        );
        doc.fontSize(12).text(
            'network devices.', 
            { align: 'left', indent: 20, paragraphIndent: 20 } // Apply indent and paragraphIndent to wrap the text correctly
        );
        doc.fontSize(12).text(
            'scanning', 
            { align: 'left', indent: 20, paragraphIndent: 20 } // Apply indent and paragraphIndent to wrap the text correctly
        );
        doc.moveDown();
        // Risk Profile Section
        doc.fontSize(18).text('Risk Profile', { align: 'left' ,indent: 20});
        doc.fontSize(12).text('A system’s risk profile is constructed by considering the results by severity class of all known ', { align: 'left' , indent: 20});
        doc.fontSize(12).text('common vulnerabilities. The information below respectively shows the system’s risk profile of ', { align: 'left' , indent: 20});
        doc.fontSize(12).text('the number of affected hosts by severity class as well as vulnerability per identified category.', { align: 'left' , indent: 20});
        doc.moveDown();

        // Add the Vulnerability Summary Table
        doc.fontSize(14).text('Vulnerability Summary', { align: 'left' ,indent: 20});
        doc.moveDown(0.5);

        // Define table dimensions and position
        let tableTop = doc.y;
        const tableLeft = 50;
        const tableWidth = 500;
        const cellPadding = 5;
        let columnWidths = [150, 175, 175];
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
        //doc.rect(totalRowY, tableLeft, tableWidth, rowHeight).fillAndStroke('darkblue', 'black');
        doc.fillColor('white').text('Total', tableLeft + cellPadding, totalRowY + cellPadding, { width: columnWidths[0], align: 'center' });
        doc.text((ReportscriticalCount + ReportsmediumCount + ReportslowCount).toString(), tableLeft + columnWidths[0] + cellPadding, totalRowY + cellPadding, { width: columnWidths[1], align: 'center' });
        doc.text((uniqueCriticalHostsCount + uniqueMediumHostsCount + uniqueLowHostsCount).toString(), tableLeft + columnWidths[0] + columnWidths[1] + cellPadding, totalRowY + cellPadding, { width: columnWidths[2], align: 'center' });

        const checkPageOverflow = (requiredSpace) => {
            const currentY = doc.y;
            const pageHeight = doc.page.height;
            
            // Check if there's enough space remaining for the required space
            if (currentY + requiredSpace > pageHeight - 100) {  // Leave some space for footer
                addNewPage();
            }
        };
        addFooter();
        doc.moveDown();
        doc.fontSize(16).text('Vulnerability Distribution', { align: 'center' });
        doc.moveDown(2);
        checkPageOverflow(300); // Adjust the required space for your chart size
        doc.image(pieChartBuffer, {
            fit: [500, 300],
            align: 'center',
            valign: 'center'
        })
        doc.moveDown(17);
        // Add the trend graph
        // addNewPage();
        checkPageOverflow(300); // Adjust for the trend graph size
        doc.fontSize(16).text('Trend Graph', { align: 'center' });
        doc.moveDown(1);

        // Embed the trend graph image in the PDF
        doc.image(imageBuffer, {
            fit: [500, 300],
            align: 'center',
            valign: 'center'
        });
        addFooter();
        checkPageOverflow(300); // Adjust for the trend graph size
        doc.fontSize(16).text('Vulnerabilities Detail Table', { align: 'center' });
        doc.moveDown();
        let vulnerabilityTableData = Array.from(aggregatedVulnerabilities.values()).map(entry => {
            // Sort the hosts
            let sortedHosts = entry.hosts.sort((a, b) => a.localeCompare(b));

            // Function to condense IP addresses into ranges and CIDR notation
            const condenseHosts = (hosts) => {
                if (hosts.length === 0) return '';

                let ranges = [];
                let start = hosts[0];
                let end = hosts[0];

                for (let i = 1; i < hosts.length; i++) {
                    if (hosts[i] === incrementIP(end)) {
                        end = hosts[i];
                    } else {
                        ranges.push(createCIDR(start, end));
                        start = hosts[i];
                        end = hosts[i];
                    }
                }

                // Push the last range
                ranges.push(createCIDR(start, end));
                return ranges.join(', ');
            };

            // Function to increment an IP address
            const incrementIP = (ip) => {
                let parts = ip.split('.').map(Number);
                for (let i = parts.length - 1; i >= 0; i--) {
                    if (parts[i] < 255) {
                        parts[i]++;
                        break;
                    } else {
                        parts[i] = 0;
                    }
                }
                return parts.join('.');
            };

            // Function to calculate CIDR notation for a range
            const createCIDR = (start, end) => {
                if (start === end) return start; // Single IP, no CIDR needed

                let startParts = start.split('.').map(Number);
                let endParts = end.split('.').map(Number);

                // Calculate the difference between the start and end IPs
                let diff = 0;
                for (let i = 0; i < 4; i++) {
                    diff = (diff << 8) + (endParts[i] - startParts[i]);
                }

                // Find the highest bit that differs
                let mask = 32;
                while (diff > 0) {
                    diff >>= 1;
                    mask--;
                }

                return `${start}/${mask}`;
            };

            return {
                vulnerability: entry.vulnerability,
                cvss: entry.cvss,
                host: condenseHosts(sortedHosts)
            };
        });
        // Set up the table headers
        // const tableTopY = doc.y;
        // const tableLeftX = 50;
        // const columnWidths2 = [200, 100, 250]; // Set widths for the columns

        // // Draw the table header background
        // doc.rect(tableLeftX, tableTopY, columnWidths2[0] + columnWidths2[1] + columnWidths2[2], 25).fillAndStroke('darkblue', 'black');

        // // Draw column titles
        // doc.fillColor('white').fontSize(12).text('Vulnerability', tableLeftX + 5, tableTopY + 5, { width: columnWidths[0], align: 'center' });
        // doc.text('CVSS Score', tableLeftX + columnWidths2[0] + 5, tableTopY + 5, { width: columnWidths2[1], align: 'center' });
        // doc.text('Hosts', tableLeftX + columnWidths2[0] + columnWidths2[1] + 5, tableTopY + 5, { width: columnWidths2[2], align: 'center' });

        // // Reset fill color for table rows
        // doc.fillColor('black');

        // // Helper function to draw a row
        // const drawTableRow = (y, vulnerability, cvss, hosts) => {
        //     doc.rect(tableLeftX, y, columnWidths2[0], 25).stroke();
        //     doc.rect(tableLeftX + columnWidths2[0], y, columnWidths2[1], 25).stroke();
        //     doc.rect(tableLeftX + columnWidths2[0] + columnWidths2[1], y, columnWidths2[2], 25).stroke();

        //     doc.text(vulnerability, tableLeftX + 5, y + 5, { width: columnWidths2[0], align: 'center' });
        //     doc.text(cvss.toString(), tableLeftX + columnWidths2[0] + 5, y + 5, { width:columnWidths2[1], align: 'center' });
        //     doc.text(hosts, tableLeftX + columnWidths2[0] + columnWidths2[1] + 5, y + 5, { width:columnWidths2[2], align: 'center' });
        // };

        // // Iterate through the vulnerabilityTableData and add rows to the table
        // vulnerabilityTableData.forEach((entry, index) => {
        //     const rowY = tableTopY + 25 + (index * 25);
        //     drawTableRow(rowY, entry.vulnerability, entry.cvss, entry.host);

        //     // If the row goes beyond the page, add a new page
        //     if (rowY + 50 > doc.page.height - 50) {
        //         addFooter();
        //         doc.addPage();
        //         addHeader();
        //     }
        // });
        const tableconfiguration = {
            type: 'bar',
            data: {
                labels: vulnerabilityTableData.map(entry => entry.vulnerability),
                datasets: [
                    {
                        label: 'CVSS',
                        data: vulnerabilityTableData.map(entry => entry.cvss),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Hosts',
                        data: vulnerabilityTableData.map(entry => entry.host),
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10, // Adjust as needed
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        enabled: true,
                    },
                },
            },
        };

        const image = await chartJSNodeCanvas.renderToBuffer(tableconfiguration);
        // Add the table to the PDF
        doc.image(image, {
            fit: [500, 300],
            align: 'center',
            valign: 'center'
        });
        // Finalize the PDF and send it
        addFooter();
        // Finalize the PDF and send it
        doc.end();

    } catch (error) {
        console.error('Error generating executive report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/reports/tech/:report_id', authenticateToken, async (req, res) => {
    try {
        const { report_id } = req.params;

        const ipToInteger = (ip) => {
            return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
        };

        const integerToIp = (int) => {
            return [
                (int >>> 24) & 255,
                (int >>> 16) & 255,
                (int >>> 8) & 255,
                int & 255
            ].join('.');
        };
        const calculateIpRange = (hosts) => {
            // Convert IPs to integers
            const ipIntegers = hosts.map(ip => ipToInteger(ip));
            
            // Sort IPs in ascending order
            ipIntegers.sort((a, b) => a - b);
            
            // Get the smallest and largest IPs
            const smallestIp = integerToIp(ipIntegers[0]);
            const largestIp = integerToIp(ipIntegers[ipIntegers.length - 1]);
            
            // Return the IP range
            return `${smallestIp}-${largestIp}`;
        };
        const truncateIPsToRange = (hosts) => {
            // Convert the IP addresses into a form like '10.242.111.111-10.243.000.000'
            return hosts
                .map(ip => {
                    const parts = ip.split('.');
                    if (parts.length === 4) {
                        // Return the IP address range based on the first two octets, with the remaining octets in range format
                        return `${parts[0]}.${parts[1]}.111.111-${parts[0]}.${parts[1]}.000.000`;
                    }
                    return ip; // In case the IP format is not as expected, return it unchanged
                })
                // Sort the IPs in descending order
                .sort((a, b) => {
                    const ipA = a.split('.').map(Number);
                    const ipB = b.split('.').map(Number);
                    // Compare from largest octet to smallest
                    for (let i = 0; i < 4; i++) {
                        if (ipA[i] !== ipB[i]) return ipB[i] - ipA[i];
                    }
                    return 0;
                });
        };
        // Fetch the report data by ID
        const reportResult = await pgClient.query(
            'SELECT report_id, created_at, content FROM reports WHERE report_id = $1',
            [report_id]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        const report = reportResult.rows[0];

        const clientName = report.title || 'UnknownClient';
        const reportCreationDate = new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            autoFirstPage: false
        });

        const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
        let filename = `CoVarExecutive-${sanitizedClientName}-${reportCreationDate}.pdf`;
        filename = encodeURIComponent(filename);
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        const creationDate = new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

        // Cover Page Setup (same as before)
        doc.addPage();
        const imagePath = path.join(__dirname, '../routes/assets/4546131_3922.jpg');
        doc.image(imagePath, { fit: [500, 500], align: 'center', valign: 'center' });
        doc.moveDown(35);

        doc.rect(50, doc.y, 500, 70).fill('darkblue');
        doc.fontSize(24).fillColor('white').text('Cyber Security Vulnerability Report', 60, doc.y, { align: 'left' });
        doc.text(reportCreationDate, 60, doc.y + 10, { align: 'left' });

        doc.rect(50, doc.y, 500, 30).fill('gray');
        doc.fontSize(12).fillColor('white').text('BlueVision ITM (Pty) Limited', 60, doc.y + 10, { align: 'left' });

        doc.moveDown(4);
        doc.fontSize(8).fillColor('gray').text(`Disclosure Classification: Confidential`, { align: 'left' });
        doc.text(`${creationDate} Revision: 1.0`, { align: 'right' });

        const addHeader = () => {
            const leftText = `Cyber Security Vulnerability Report ${creationDate}`;
            const rightText = `BlueVision ITM (Pty) Limited`;

            // Draw the left text aligned to the left side
            doc.fontSize(10).text(leftText, 50, 40, {
                width: doc.page.width / 2 - 50, // Leave space for the right text
                align: 'left'
            });

            // Draw the right text aligned to the right side
            doc.fontSize(10).text(rightText, 0, 40, {
                width: doc.page.width - 100,  // Ensures padding on both sides
                align: 'right'
            });
        };
        
        let pagenumber = 1;
        const addFooter = () => {
            const footerText = `Cyber Security Vulnerability Report ${creationDate} Revision: 1.0 | Disclosure Classification: Confidential | © Copyright BlueVision ITM (PTY) Limited – All Rights Reserved. | Page ${pagenumber++}`;
            doc.fontSize(8).fillColor('gray').text(footerText, 50, doc.page.height - 90, {
                width: doc.page.width - 100, // Leaves some padding on both sides
                align: 'center' // Center align the footer text
            });
        };

        const addNewPage = () => {
            if (pagenumber > 0) {          
                addFooter(); 
            }
            doc.addPage(); 
            addHeader();    
        };
        

        addNewPage();
        doc.moveDown();
        doc.moveDown();
        doc.moveDown();
        doc.fontSize(20).text('Technical Report', { align: 'center' });
        doc.moveDown();

        // Date Created Section
        doc.text(`Date Created: ${new Date(report.created_at).toLocaleDateString()}`, { indent: 20 }); // Move Date Created slightly to the right
        doc.moveDown();

       // Vulnerability Manager Section
       doc.fontSize(18).fillColor('black').text('Vulnerability Manager', { align: 'left', indent: 20 }); // Move slightly to the right with indent
        doc.fontSize(12).text(
            'Greenbone Vulnerability Manager is proprietary software used to perform vulnerability scans on ', 
            { align: 'left', indent: 20, paragraphIndent: 20 } // Apply indent and paragraphIndent to wrap the text correctly
        );
        doc.fontSize(12).text(
            'network devices. ', 
            { align: 'left', indent: 20, paragraphIndent: 20 } // Apply indent and paragraphIndent to wrap the text correctly
        );
        doc.fontSize(12).text(
            'scanning', 
            { align: 'left', indent: 20, paragraphIndent: 20 } // Apply indent and paragraphIndent to wrap the text correctly
        );
        doc.moveDown();
        addNewPage();
        // Updated Table of Contents
        doc.fontSize(14).text('Table of Contents', { align: 'left', indent: 20 }); // Move Table of Contents slightly to the right
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const tableLeft = 50;
        const tableWidth = 450;  // Reduced total width for the table
        const cellPadding = 5;
        let columnWidths = [50, 100, 100, 200];  // Updated column widths for smaller size
        const rowHeight = 25;

        // Table header background
        doc.rect(tableLeft, tableTop, tableWidth, rowHeight).fillAndStroke('darkblue', 'black');

        // Table headers with 4th column "Hosts"
        doc.fillColor('white').fontSize(10).text('No.', tableLeft + cellPadding, tableTop + cellPadding, { width: columnWidths[0], align: 'center' });
        doc.text('Vulnerability', tableLeft + columnWidths[0] + cellPadding, tableTop + cellPadding, { width: columnWidths[1], align: 'center' });
        doc.text('CVSS Score', tableLeft + columnWidths[0] + columnWidths[1] + cellPadding, tableTop + cellPadding, { width: columnWidths[2], align: 'center' });
        doc.text('Hosts', tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + cellPadding, tableTop + cellPadding, { width: columnWidths[3], align: 'center' });

        doc.fillColor('black');
        const checkPageOverflow = (rowHeight) => {
            if (doc.y + rowHeight > doc.page.height - 100) {  // Reserve space for footer
                addNewPage();
                doc.y = 50;  
            }
        };
        const drawRow = (y, index, vulnerability, cvss, hosts) => {
            const textOptions = { width: columnWidths[1] - 2 * cellPadding, align: 'left' };
            const cvssOptions = { width: columnWidths[2] - 2 * cellPadding, align: 'center' };
            const hostsOptions = { width: columnWidths[3] - 2 * cellPadding, align: 'center' };
        
            // Calculate the IP range instead of listing individual IPs
            const hostsRange = calculateIpRange(hosts);
        
            // Calculate the height needed for the vulnerability, CVSS score, and hosts text
            const vulnerabilityHeight = doc.heightOfString(vulnerability, textOptions);
            const cvssHeight = doc.heightOfString(cvss, cvssOptions);
            const hostsHeight = doc.heightOfString(hostsRange, hostsOptions);
        
            // Determine the maximum height of the row based on the largest content
            const rowHeightAdjusted = Math.max(vulnerabilityHeight, cvssHeight, hostsHeight) + 2 * cellPadding;
        
            // Check if there is enough space for the next row, and add a new page if needed
            checkPageOverflow(rowHeightAdjusted);
        
            // Draw table cells
            doc.rect(tableLeft, y, columnWidths[0], rowHeightAdjusted).stroke();
            doc.rect(tableLeft + columnWidths[0], y, columnWidths[1], rowHeightAdjusted).stroke();
            doc.rect(tableLeft + columnWidths[0] + columnWidths[1], y, columnWidths[2], rowHeightAdjusted).stroke();
            doc.rect(tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2], y, columnWidths[3], rowHeightAdjusted).stroke();
        
            // Write text inside the cells
            doc.text(index.toString(), tableLeft + cellPadding, y + cellPadding, { width: columnWidths[0], align: 'center' });
            doc.text(vulnerability, tableLeft + columnWidths[0] + cellPadding, y + cellPadding, textOptions);
            doc.text(cvss, tableLeft + columnWidths[0] + columnWidths[1] + cellPadding, y + cellPadding, cvssOptions);
            doc.text(hostsRange, tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + cellPadding, y + cellPadding, hostsOptions);
        
            // Return the adjusted row height for positioning the next row
            return rowHeightAdjusted;
        };

        // Fetch and loop through the report TOC data
        try {
            const reportTOCResult = await pgClient.query(
                `
                WITH final_report AS (
                    SELECT 
                        json_array_elements(content->'finalReport') AS report_element 
                    FROM reports 
                    WHERE report_id = $1
                )
                SELECT 
                    report_element ->> 'nvtName' AS nvt_name, 
                    json_agg(report_element ->> 'IP') AS hosts, 
                    report_element ->> 'CVSS' AS cvss_score
                FROM final_report 
                GROUP BY nvt_name, cvss_score;
                `,
                [report_id]
            );
           
            let currentY = tableTop + rowHeight;  // Initial Y position for the first row

        // Draw rows dynamically
        reportTOCResult.rows.forEach((row, index) => {
            const adjustedRowHeight = drawRow(currentY, index + 1, row.nvt_name, row.cvss_score, row.hosts);
            currentY += adjustedRowHeight;  // Move Y position for the next row
            
            // Check for page overflow and reset currentY if necessary
            if (currentY + adjustedRowHeight > doc.page.height - 100) {  // If we need to add a new page
                addNewPage();
                currentY = 50;  // Reset currentY to start from the top of the new page
            }
        });

        } catch (error) {
            console.error("Error fetching report TOC:", error);
            if (!res.headersSent) {  // Check if headers were already sent
                res.status(500).send('Error fetching reports');
            }
        }

        const TechreportResult = await pgClient.query(`
            WITH final_report AS (
                SELECT 
                    json_array_elements(content->'finalReport') AS report_element 
                FROM reports 
                WHERE report_id = $1
            )
            SELECT 
                report_element ->> 'nvtName' AS Title, 
                json_agg(report_element ->> 'IP') AS IP, 
                report_element ->> 'CVSS' AS cvss_score,
                report_element ->> 'Severity' AS Level,
                report_element ->> 'Summary' AS Description,
                report_element ->> 'CVEs' AS CVEs,
                report_element ->> 'Impact' AS Impact,
                report_element ->> 'vulnerabilityInsight' AS Details,
                report_element ->> 'Solution' AS Recommendation,
                report_element ->> 'Hostname' AS Hostname,
                report_element ->> 'Port' AS PortNumber,
                report_element ->> 'portProtocol' AS PortProtocol,
                report_element ->> 'vulnerabilityDetectionMethod' AS Result
            FROM final_report 
            GROUP BY 
                report_element ->> 'nvtName', 
                report_element ->> 'CVSS',
                report_element ->> 'Severity',
                report_element ->> 'Summary',
                report_element ->> 'CVEs',
                report_element ->> 'Impact',
                report_element ->> 'vulnerabilityInsight',
                report_element ->> 'Solution',
                report_element ->> 'Hostname',
                report_element ->> 'Port',
                report_element ->> 'portProtocol',
                report_element ->> 'vulnerabilityDetectionMethod';
        `, [report_id]);
        
        
        // Define column widths (adjusted for the new Result column)
        const titleColumnWidth = 75; // Width for the title labels
        const dataColumnWidth = 250; // Adjusted width for the Host name
        const smallColumnWidth = 60;  // Smaller width for IP, Port, Protocol fields
        const resultColumnWidth = 200; // Width for the Result (vulnerability detection method) field
        const hostnameColumnWidth = 120;
        TechreportResult.rows.forEach((row) => {
            // Add a new page for each row
            addNewPage();
        
            // Prepare the fields for the current row
            const fields = [
                { label: 'Title', value: row.title || 'N/A' },
                { label: 'Level', value: row.level || 'N/A' },
                { label: 'Description', value: row.description || 'N/A' },
                { label: 'Impact', value: row.impact || 'N/A' },
                { label: 'Recommendation', value: row.recommendation || 'N/A' },
                { label: 'Details', value: row.details || 'N/A' },
                { label: 'CVEs', value: row.cves || 'N/A' },
                { label: 'CVSS Score', value: row.cvss_score || 'N/A' }
            ];
        
            let currentY = 100; // Set starting position for the fields
        
            // Draw each field with its title label and background
            fields.forEach((field) => {
                const titleXPosition = 50; // Position for the title label on the left
                const dataXPosition = titleXPosition + titleColumnWidth + 10; // Position for the data field
        
                const textOptions = { width: dataColumnWidth - 2 * cellPadding, align: 'left' };
        
                // Calculate height of the text (in case it needs to wrap)
                const fieldHeight = doc.heightOfString(field.value, textOptions);
                const adjustedRowHeight = Math.max(fieldHeight + 2 * cellPadding, rowHeight); // Ensure at least rowHeight
        
                // Draw the blue background for the title label
                doc.rect(titleXPosition, currentY, titleColumnWidth, adjustedRowHeight).fill('darkblue');
        
                // Draw the title label text in white over the blue background
                doc.font('Helvetica-Bold').fillColor('white');
                doc.text(field.label, titleXPosition + cellPadding, currentY + cellPadding, { width: titleColumnWidth - 2 * cellPadding, align: 'left' });
        
                // Draw the data field next to the title with default color (black)
                doc.font('Helvetica').fillColor('black');
                doc.text(field.value, dataXPosition, currentY + cellPadding, textOptions);
        
                // Draw borders around the data field if needed
                doc.rect(dataXPosition - cellPadding, currentY, dataColumnWidth, adjustedRowHeight).stroke();
        
                // Update Y position
                currentY += adjustedRowHeight;
            });
        
            // Add new table below each report with the headers: IP, Host name, Port number, Port protocol, and Result
            currentY += 20; // Space between the fields and the new table
        
            // Define the table headers and data
            const tableHeaders = ['IP', 'Host name', 'Port number', 'Port protocol', 'Result'];
            const tableData = [row.ip || 'N/A', row.hostname || 'N/A', row.portnumber || 'N/A', row.portprotocol || 'N/A', row.result || 'N/A'];
        
            // Set the starting position of the table
            let tableX = 50;
        
            // Draw the headers with a blue background and borders
            tableHeaders.forEach((header, index) => {
                // Adjust column width for the new Result field
                let columnWidth;
                switch (index) {
                    case 1: columnWidth = hostnameColumnWidth; break; // Hostname gets the larger width
                    case 4: columnWidth = resultColumnWidth; break; // Result column width
                    default: columnWidth = smallColumnWidth; break; // IP, Port number, and Protocol get smaller width
                }
        
                // Draw the header cell background and text
                doc.rect(tableX, currentY, columnWidth, rowHeight).fill('darkblue');
                doc.font('Helvetica-Bold').fillColor('white');
                doc.text(header, tableX + cellPadding, currentY + cellPadding, { width: columnWidth - 2 * cellPadding, align: 'center' });
        
                // Draw the border around the header cell
                doc.rect(tableX, currentY, columnWidth, rowHeight).stroke();
        
                tableX += columnWidth; // Move X position for the next header
            });
        
            currentY += rowHeight; // Move Y for data row
        
            // Reset X position and draw the data for each header with dynamic row height
            tableX = 50;
        
            // First, calculate the maximum row height based on the data in all cells of the row
            let maxRowHeight = rowHeight; // Initialize with the default rowHeight
            tableData.forEach((data, index) => {
                let columnWidth;
                switch (index) {
                    case 1: columnWidth = hostnameColumnWidth; break; // Hostname gets the larger width
                    case 4: columnWidth = resultColumnWidth; break; // Result column width
                    default: columnWidth = smallColumnWidth; break; // IP, Port number, and Protocol get smaller width
                }
        
                // Calculate the height of the text for each cell based on its column width
                const textOptions = { width: columnWidth - 2 * cellPadding, align: 'center' };
                const cellTextHeight = doc.heightOfString(data, textOptions);
                
                // Find the largest height among all the cells in this row
                maxRowHeight = Math.max(maxRowHeight, cellTextHeight + 2 * cellPadding); 
            });
        
            // Now that we know the maximum height, apply it uniformly to all cells in the row
            tableX = 50; // Reset X position to draw data cells
            tableData.forEach((data, index) => {
                let columnWidth;
                switch (index) {
                    case 1: columnWidth = hostnameColumnWidth; break; // Hostname gets the larger width
                    case 4: columnWidth = resultColumnWidth; break; // Result column width
                    default: columnWidth = smallColumnWidth; break; // IP, Port number, and Protocol get smaller width
                }
        
                // Draw the data cell and text
                doc.font('Helvetica').fillColor('black');
                doc.text(data, tableX + cellPadding, currentY + cellPadding, { width: columnWidth - 2 * cellPadding, align: 'center' });
        
                // Draw the border around the data cell with the maxRowHeight
                doc.rect(tableX, currentY, columnWidth, maxRowHeight).stroke();
        
                tableX += columnWidth; // Move X position for the next cell
            });
        
            currentY += maxRowHeight; // Move Y for the next row if needed
        });

        doc.end();
    } catch (error) {
        console.error('Error fetching reports:', error);
        return res.status(500).json({ error: 'An error occurred while fetching reports' });
    }
});


// const truncateToSecond = (date) => {
//     const newDate = new Date(date);
//     newDate.setMilliseconds(0);
//     return newDate.toISOString();;
// };

module.exports = router;