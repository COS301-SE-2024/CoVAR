const express = require('express');
const handleFileUpload = require('../lib/pipe');
const { authenticateToken, verifyToken } = require('../lib/securityFunctions');

const { parse } = require('csv-parse');
const stream = require('stream');
const pgClient = require('../lib/postgres');
const xml2js = require('xml2js');

const router = express.Router();



// Get file content in raw_uploads table
router.get('/uploads/file/:loid', authenticateToken, async (req, res) => {
    const { loid } = req.params;

    try {
        await pgClient.query('BEGIN');

        // Read the entire large object using lo_get
        const result = await pgClient.query('SELECT lo_get($1) AS file_content', [loid]);
        const fileContent = result.rows[0].file_content;

        await pgClient.query('COMMIT');

        // Set the content type and send the file content
        res.contentType('application/octet-stream');
        res.send(fileContent);
    } catch (err) {
        console.error(err.message);
        await pgClient.query('ROLLBACK');
        res.status(500).send('Server Error');
    }
});


//upload file to raw_uploads table

router.post('/uploads', authenticateToken, async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decodedToken = verifyToken(token);
    const vaId = decodedToken.user_id;

    await handleFileUpload(req, res, vaId);
});

//remove file from raw_uploads table
router.delete('/uploads/:upload_id', authenticateToken, async (req, res) => {
    const { upload_id } = req.params;

    try {
        await pgClient.query('BEGIN');

        // Get the LOID of the file to delete
        const result = await pgClient.query('SELECT loid FROM raw_uploads WHERE upload_id = $1', [upload_id]);
        if (result.rows.length === 0) {
            await pgClient.query('ROLLBACK');
            return res.status(404).send('File not found');
        }
        const loid = result.rows[0].loid;

        // Unlink the large object
        await pgClient.query('SELECT lo_unlink($1)', [loid]);

        // Delete the metadata from the raw_uploads table
        await pgClient.query('DELETE FROM raw_uploads WHERE upload_id = $1', [upload_id]);

        await pgClient.query('COMMIT');

        res.status(200).send('File deleted successfully');
    } catch (err) {
        await pgClient.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//For greenbone
// Generate a report from a single CSV file content in raw_uploads table and return as JSON

//Todo : Add every header from both greenbone and nessus and only display if its not empty ""
router.get('/uploads/generateSingleReport/:upload_id', authenticateToken, async (req, res) => {
    const { upload_id } = req.params;

    try {
        await pgClient.query('BEGIN');

        // Get the LOID of the file using upload_id
        const loidResult = await pgClient.query('SELECT loid FROM raw_uploads WHERE upload_id = $1', [upload_id]);

        if (loidResult.rows.length === 0) {
            await pgClient.query('ROLLBACK');
            return res.status(404).send('File not found');
        }
        const loid = loidResult.rows[0].loid;

        const fileResult = await pgClient.query('SELECT lo_get($1) AS file_content', [loid]);
        const fileContent = fileResult.rows[0].file_content;

        await pgClient.query('COMMIT');

        const fileSignature = fileContent.toString('utf8', 0, 100).trim();

        if (fileSignature.startsWith('<?xml')) {
            xml2js.parseString(fileContent, { explicitArray: false }, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err);
                    return res.status(500).send('Error processing XML');
                }

                // Extract ReportItem elements
                const allItems = findAllReportItems(result);

                // Filter out ReportItems where risk_factor is "None"
                const filteredItems = allItems.filter(item => item.risk_factor && item.risk_factor.toLowerCase() !== 'none');

                // Rename fields in the filtered items
                const renamedItems = filteredItems.map(item => {
                    const {
                        $: {
                            port: Port,
                            svc_name: svc_name,
                            protocol: portProtocol,
                            pluginID: pluginID,
                            pluginName: nvtName,
                            pluginFamily: PluginFamily
                        },
                        cve: CVEs = '',
                        cvss3_base_score: CVSS3BaseScore,
                        cvss3_vector: CVSS3Vector,
                        cvss_base_score: CVSS,
                        cvss_vector: CVSSVector,
                        description: specificResult,
                        fname: FileName,
                        plugin_modification_date: PluginModificationDate,
                        plugin_publication_date: PluginPublicationDate,
                        plugin_type: PluginType,
                        risk_factor: Severity,
                        script_version: ScriptVersion,
                        see_also: SeeAlso,
                        solution: Solution,
                        synopsis: Synopsis,
                        plugin_output: PluginOutput
                    } = item;
                    const IP = "";
                    const Summary = "";
                    const nvtOid = "";
                    const taskId = "";
                    const taskName = "";
                    const Timestamp = "";
                    const resultId = "";
                    const Impact = "";
                    const affectedSoftwareOs = "";
                    const vulnerabilityInsight = "";
                    const vulnerabilityDetectionMethod = "";
                    const productDetectionResult = "";
                    const BIDs = "";
                    const CERTs = "";
                    const otherReferences = "";
                    const Hostname = "";
                    const solutionType = "";

                    return {
                        IP, Hostname, Port, portProtocol, CVSS, Severity, solutionType, nvtName,
                        Summary, specificResult, nvtOid, CVEs, taskId, taskName, Timestamp,
                        resultId, Impact, Solution, affectedSoftwareOs, vulnerabilityInsight,
                        vulnerabilityDetectionMethod, productDetectionResult, BIDs, CERTs, otherReferences
                    };
                });

                // Respond with the filtered and renamed JSON data
                return res.json(renamedItems);
            });

        } else {
            // Handle CSV file
            const records = [];
            const parser = parse({
                columns: true,
                trim: true,
                skipEmptyLines: true,
            });

            const bufferStream = new stream.PassThrough();
            bufferStream.end(Buffer.from(fileContent, 'binary'));

            parser.on('readable', function () {
                let record;
                while ((record = parser.read()) !== null) {
                    // Process record based on expected headers
                    if (record['Plugin ID']) {
                        const {
                            'Plugin ID': pluginID,
                            'CVE': CVEs,
                            'CVSS v2.0 Base Score': CVSS,
                            'Risk': Severity,
                            'Host': IP,
                            'Protocol': portProtocol,
                            Port,
                            'Name': nvtName,
                            Synopsis,
                            'Description': specificResult,
                            Solution,

                        } = record;


                        const Summary = "";
                        const nvtOid = "";
                        const taskId = "";
                        const taskName = "";
                        const Timestamp = "";
                        const resultId = "";
                        const Impact = "";
                        const affectedSoftwareOs = "";
                        const vulnerabilityInsight = "";
                        const vulnerabilityDetectionMethod = "";
                        const productDetectionResult = "";
                        const BIDs = "";
                        const CERTs = "";
                        const otherReferences = "";
                        const Hostname = "";
                        const solutionType = "";

                        if (Severity && Severity !== 'None') {
                            records.push({
                                IP, Hostname, Port, portProtocol, CVSS, Severity, solutionType, nvtName,
                                Summary, specificResult, nvtOid, CVEs, taskId, taskName, Timestamp,
                                resultId, Impact, Solution, affectedSoftwareOs, vulnerabilityInsight,
                                vulnerabilityDetectionMethod, productDetectionResult, BIDs, CERTs, otherReferences
                            });
                        }
                    } else {
                        const {
                            IP, Hostname, Port, 'Port Protocol': portProtocol, CVSS, Severity, 'Solution Type': solutionType,
                            'NVT Name': nvtName, Summary, 'Specific Result': specificResult, 'NVT OID': nvtOid,
                            CVEs, 'Task ID': taskId, 'Task Name': taskName, Timestamp, 'Result ID': resultId,
                            Impact, Solution, 'Affected Software/OS': affectedSoftwareOs, 'Vulnerability Insight': vulnerabilityInsight,
                            'Vulnerability Detection Method': vulnerabilityDetectionMethod, 'Product Detection Result': productDetectionResult,
                            BIDs, CERTs, 'Other References': otherReferences
                        } = record;

                        if (IP || Hostname || Port) {
                            records.push({
                                IP, Hostname, Port, portProtocol, CVSS, Severity, solutionType, nvtName,
                                Summary, specificResult, nvtOid, CVEs, taskId, taskName, Timestamp,
                                resultId, Impact, Solution, affectedSoftwareOs, vulnerabilityInsight,
                                vulnerabilityDetectionMethod, productDetectionResult, BIDs, CERTs, otherReferences
                            });
                        }
                    }
                }
            });

            parser.on('end', function () {
                res.json(records);
            });

            parser.on('error', function (err) {
                console.error(err.message);
                res.status(500).send('Error processing CSV');
            });

            bufferStream.pipe(parser);
        }
    } catch (err) {
        console.error(err.message);
        await pgClient.query('ROLLBACK');
        res.status(500).send('Server Error');
    }
});

// Helper function to find all ReportItem elements in the parsed JSON
function findAllReportItems(obj) {
    let items = [];

    function recurse(current) {
        if (Array.isArray(current)) {
            current.forEach(recurse);
        } else if (current && typeof current === 'object') {
            Object.keys(current).forEach(key => {
                if (key === 'ReportItem') {
                    if (Array.isArray(current[key])) {
                        items = items.concat(current[key]);
                    } else {
                        items.push(current[key]);
                    }
                } else {
                    recurse(current[key]);
                }
            });
        }
    }

    recurse(obj);
    return items;
}


// Toggle the value in_report to true/false for a specific file
router.put('/uploads/inReport/:upload_id', authenticateToken, async (req, res) => {
    const { upload_id } = req.params;

    try {
        await pgClient.query('BEGIN');

        const currentResult = await pgClient.query(
            'SELECT in_report FROM raw_uploads WHERE upload_id = $1',
            [upload_id]
        );

        if (currentResult.rows.length === 0) {
            await pgClient.query('ROLLBACK');
            return res.status(404).send('File not found');
        }

        const currentValue = currentResult.rows[0].in_report;
        const newValue = !currentValue;

        const updateResult = await pgClient.query(
            'UPDATE raw_uploads SET in_report = $1 WHERE upload_id = $2 RETURNING *',
            [newValue, upload_id]
        );

        if (updateResult.rows.length === 0) {
            await pgClient.query('ROLLBACK');
            return res.status(404).send('File not found');
        }

        await pgClient.query('COMMIT');
        res.status(200).send('File report status toggled successfully');
    } catch (err) {
        await pgClient.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all uploads for a specific organization assigned to logged in VA
router.get('/uploads/organization/:organizationName', authenticateToken, async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decodedToken = verifyToken(token);
    const id = decodedToken.user_id;
    const { organizationName } = req.params;

    try {
        // Get the UUID for the organizationName
        const orgResult = await pgClient.query(
            'SELECT organization_id FROM organizations WHERE name = $1',
            [organizationName]
        );

        if (orgResult.rows.length === 0) {
            return res.status(404).send('Organization not found');
        }

        const organizationId = orgResult.rows[0].organization_id;

        // Fetch uploads for the organization UUID
        const uploads = await pgClient.query(
            'SELECT * FROM raw_uploads WHERE va = $1 AND organization = $2',
            [id, organizationId]
        );

        res.send(uploads.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all uploads for a specific client assigned to logged in VA
router.get('/uploads/client/:clientName', authenticateToken, async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decodedToken = verifyToken(token);
    const id = decodedToken.user_id;
    const { clientName } = req.params;

    try {
        // Get the UUID for the clientName
        const clientResult = await pgClient.query(
            'SELECT user_id FROM users WHERE username = $1',
            [clientName]
        );

        if (clientResult.rows.length === 0) {
            return res.status(404).send('Client not found');
        }

        const clientId = clientResult.rows[0].user_id;

        // Fetch uploads for the client UUID
        const uploads = await pgClient.query(
            'SELECT * FROM raw_uploads WHERE va = $1 AND client = $2',
            [id, clientId]
        );

        res.send(uploads.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Endpoint to generate report
router.post('/uploads/generateReport', authenticateToken, async (req, res) => {
    const { finalReport, name, type } = req.body;
    
    if (!finalReport || finalReport.length === 0) {
        return res.status(400).json({ error: 'Reports or report IDs are missing' });
    }

    try {
        // Combine finalReport into a single JSON object
        const combinedReport = { finalReport };

        // Insert combined report into the reports table
        const insertQuery = 'INSERT INTO reports (title, content) VALUES ($1, $2) RETURNING *';
        const result = await pgClient.query(insertQuery, [name, combinedReport]);
        const reportId = result.rows[0].report_id;

        let id;

        if (type === 'client') {
            // Get user_id from the users table
            const getClientId = 'SELECT user_id FROM users WHERE username = $1';
            const clientResult = await pgClient.query(getClientId, [name]);

            if (clientResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            id = clientResult.rows[0].user_id;

            // Insert into user_reports
            const insertUserReports = 'INSERT INTO user_reports (user_id, report_id) VALUES ($1, $2)';
            await pgClient.query(insertUserReports, [id, reportId]);

        } else if (type === 'org') {
            // Get organization_id from the organizations table
            const getOrgId = 'SELECT organization_id FROM organizations WHERE organization_name = $1';
            const orgResult = await pgClient.query(getOrgId, [name]);

            if (orgResult.rows.length === 0) {
                return res.status(404).json({ error: 'Organization not found' });
            }

            id = orgResult.rows[0].organization_id;

            // Insert into organization_reports
            const insertOrgReports = 'INSERT INTO organization_reports (organization_id, report_id) VALUES ($1, $2)';
            await pgClient.query(insertOrgReports, [id, reportId]);

        } else {
            return res.status(400).json({ error: 'Invalid type specified' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;