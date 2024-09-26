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
        

        // console.log(reportResult.rows);
        let reports = reportsResult.rows.map(report => {
            const content = report.content.finalReport; // Accessing the 'reports' array within the content object
            //console.log("Report Content:", content); // Log the entire content to see its structure
            let criticalCount = 0;
            let mediumCount = 0;
            let lowCount = 0;

            content.forEach(reportItem => {

                //console.log("Item:", item); // Log the entire item to examine its structure
                let severity = reportItem.Severity || reportItem.severity; // Check for both 'Severity' and 'severity'

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

router.post('/reports/getReportsPerClient', authenticateToken, async (req, res) => {
    try {
        const user = req.user; // Get the logged-in VA user
        console.log('VA user:', user);

        // Query to get the clients assigned to the logged-in VA
        const assignedClientsQuery = `
            SELECT u.user_id, u.username 
            FROM assignment a
            INNER JOIN users u ON a.client = u.user_id
            WHERE a.va = $1
        `;
        const assignedClientsResult = await pgClient.query(assignedClientsQuery, [user.user_id]);

        if (assignedClientsResult.rows.length === 0) {
            console.log('No assigned clients found');
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
                        console.log("Unknown severity:", severity);
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
        // console.log("Unique Critical Hosts:", uniqueCriticalHostsCount);
        // console.log("Unique Medium Hosts:", uniqueMediumHostsCount);
        // console.log("Unique Low Hosts:", uniqueLowHostsCount);
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
            console.log('report created at', report.created_at);
            graphData = reportsResult.rows;
            console.log('graph data', graphData);
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
            console.log('graph data', graphData);
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
        console.log('trend data', trendData);
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
        doc.fontSize(8).fillColor('gray').text(`Disclosure Classification: Confidential`, { align: 'left' });
        doc.text(`2022 Revision: 1.0`, { align: 'right' });

        // Function to add header and footer to each page
        const addHeader = () => {
            doc.fontSize(10).text(`Cyber Security Vulnerability Report ${creationDate}`, 50, 40);
            doc.text(`BlueVision ITM (Pty) Limited`, { align: 'right' });
            doc.moveDown();
        };
        let pagenumber = 1;
        const addFooter = () => {
            doc.fontSize(8).fillColor('gray').text(`Cyber Security Vulnerability Report ${creationDate} Revision: 1.0`, 50, doc.page.height - 90);
            doc.text(`Disclosure Classification: Confidential`);
            doc.text(`© Copyright BlueVision ITM (PTY) Limited – All Rights Reserved.`);
            doc.text(`Page ${pagenumber++}`, { align: 'right' });
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
        //doc.rect(totalRowY, tableLeft, tableWidth, rowHeight).fillAndStroke('darkblue', 'black');
        doc.fillColor('white').text('Total', tableLeft + cellPadding, totalRowY + cellPadding, { width: columnWidths[0], align: 'center' });
        doc.text((ReportscriticalCount + ReportsmediumCount + ReportslowCount).toString(), tableLeft + columnWidths[0] + cellPadding, totalRowY + cellPadding, { width: columnWidths[1], align: 'center' });
        doc.text((uniqueCriticalHostsCount + uniqueMediumHostsCount + uniqueLowHostsCount).toString(), tableLeft + columnWidths[0] + columnWidths[1] + cellPadding, totalRowY + cellPadding, { width: columnWidths[2], align: 'center' });

        // Add any other content here...
        addFooter();
        doc.moveDown();
        doc.fontSize(16).text('Vulnerability Distribution', { align: 'center' });
        doc.moveDown(2);

        doc.image(pieChartBuffer, {
            fit: [500, 300],
            align: 'center',
            valign: 'center'
        })
        doc.moveDown(17);
        // Add the trend graph
        // addNewPage();
        doc.fontSize(16).text('Trend Graph', { align: 'center' });
        doc.moveDown(1);

        // Embed the trend graph image in the PDF
        doc.image(imageBuffer, {
            fit: [500, 300],
            align: 'center',
            valign: 'center'
        });
        addFooter();
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
        doc.text(`2022 Revision: 1.0`, { align: 'right' });

        const addHeader = () => {
            doc.fontSize(10).text(`Cyber Security Vulnerability Report ${creationDate}`, 50, 40);
            doc.text(`BlueVision ITM (Pty) Limited`, { align: 'right' });
            doc.moveDown();
        };
        let pagenumber = 1;
        const addFooter = () => {
            doc.fontSize(8).fillColor('gray').text(`Cyber Security Vulnerability Report ${creationDate} Revision: 1.0`, 50, doc.page.height - 90);
            doc.text(`Disclosure Classification: Confidential`);
            doc.text(`© Copyright BlueVision ITM (PTY) Limited – All Rights Reserved.`);
            doc.text(`Page ${pagenumber++}`, { align: 'right' });
        };

        const addNewPage = () => {
            if (doc.pageNumber > 0) {
                addFooter();
                doc.addPage();
            } else {
                doc.addPage();
            }
            addHeader();
        };

        addNewPage();

        doc.fontSize(20).text('Technical Report', { align: 'center' });
        doc.moveDown();
        doc.text(`Date Created: ${new Date(report.created_at).toLocaleDateString()}`);
        doc.moveDown();

        doc.fontSize(18).fillColor('black').text('Vulnerability Manager', { align: 'left' });
        doc.fontSize(12).text('Greenbone Vulnerability Manager is proprietary software...', { align: 'left' });

        doc.fontSize(18).text('Risk Profile', { align: 'left' });
        doc.fontSize(12).text('A system’s risk profile is constructed by...', { align: 'left' });
        doc.moveDown();

        // Updated Table of Contents
        doc.fontSize(14).text('Table of Contents', { align: 'left' });
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const tableLeft = 50;
        const tableWidth = 450;  // Reduced total width for the table
        const cellPadding = 5;
        const columnWidths = [50, 100, 100, 200];  // Updated column widths for smaller size
        const rowHeight = 25;

        // Table header background
        doc.rect(tableLeft, tableTop, tableWidth, rowHeight).fillAndStroke('darkblue', 'black');

        // Table headers with 4th column "Hosts"
        doc.fillColor('white').fontSize(10).text('No.', tableLeft + cellPadding, tableTop + cellPadding, { width: columnWidths[0], align: 'center' });
        doc.text('Vulnerability', tableLeft + columnWidths[0] + cellPadding, tableTop + cellPadding, { width: columnWidths[1], align: 'center' });
        doc.text('CVSS Score', tableLeft + columnWidths[0] + columnWidths[1] + cellPadding, tableTop + cellPadding, { width: columnWidths[2], align: 'center' });
        doc.text('Hosts', tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + cellPadding, tableTop + cellPadding, { width: columnWidths[3], align: 'center' });

        doc.fillColor('black');

        // Updated drawRow function to include the 4th column "Hosts"
        const drawRow = (y, index, vulnerability, cvss, hosts) => {
            const textOptions = { width: columnWidths[1] - 2 * cellPadding, align: 'left' };
            
            // Calculate the height needed for the vulnerability text
            const vulnerabilityHeight = doc.heightOfString(vulnerability, textOptions);
            const rowHeightAdjusted = Math.max(vulnerabilityHeight + 2 * cellPadding, rowHeight);  // Ensure the row height is at least the default rowHeight
        
            // Draw table cells
            doc.rect(tableLeft, y, columnWidths[0], rowHeightAdjusted).stroke();
            doc.rect(tableLeft + columnWidths[0], y, columnWidths[1], rowHeightAdjusted).stroke();
            doc.rect(tableLeft + columnWidths[0] + columnWidths[1], y, columnWidths[2], rowHeightAdjusted).stroke();
            doc.rect(tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2], y, columnWidths[3], rowHeightAdjusted).stroke();
        
            // Write text inside the cells
            doc.text(index.toString(), tableLeft + cellPadding, y + cellPadding, { width: columnWidths[0], align: 'center' });
            doc.text(vulnerability, tableLeft + columnWidths[0] + cellPadding, y + cellPadding, textOptions);
            doc.text(cvss, tableLeft + columnWidths[0] + columnWidths[1] + cellPadding, y + cellPadding, { width: columnWidths[2], align: 'center' });
            doc.text(hosts.join(', '), tableLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + cellPadding, y + cellPadding, { width: columnWidths[3], align: 'center' });
        
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
            });

        } catch (error) {
            console.error("Error fetching report TOC:", error);
            if (!res.headersSent) {  // Check if headers were already sent
                res.status(500).send('Error fetching reports');
            }
        }

        addFooter();
        addNewPage();
        
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