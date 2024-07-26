const express = require('express');
const handleFileUpload = require('../lib/pipe');
const { authenticateToken, verifyToken } = require('../lib/securityFunctions');

const { parse } = require('csv-parse');

const pgClient = require('../lib/postgres');

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


// Generate a report from a single CSV file content in raw_uploads table and return as JSON
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

        const records = [];
        const parser = parse({
            columns: true,
            trim: true
        });

        // Use the readable stream api to consume records
        parser.on('readable', function () {
            let record;
            while ((record = parser.read()) !== null) {
                const {
                    'Plugin ID': pluginID,
                    CVE,
                    'CVSS v2.0 Base Score': cvssBaseScore,
                    Risk,
                    Host,
                    Protocol,
                    Port,
                    Name,
                    Synopsis,
                    Description,
                    Solution,
                } = record;

                if (Risk && Risk !== 'None') {
                    records.push({
                        pluginID,
                        CVE,
                        cvssBaseScore,
                        Risk,
                        Host,
                        Protocol,
                        Port,
                        Name,
                        Synopsis,
                        Description,
                        Solution,
                    });
                }
            }
        });


        parser.on('error', function (err) {
            console.error(err.message);
            res.status(500).send('Error processing CSV');
        });

        // Send the records as JSON once parsing is done
        parser.on('end', function () {

            res.json(records);
        });

        // Write data to the stream
        const stream = require('stream');
        const bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(fileContent, 'binary'));
        bufferStream.pipe(parser);

    } catch (err) {
        console.error(err.message);
        await pgClient.query('ROLLBACK');
        res.status(500).send('Server Error');
    }
});

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
router.post('/uploads/generateReport', async (req, res) => {
    const { reports, reportIds, client } = req.body;

    if (!reports || reports.length === 0 || !reportIds || reportIds.length === 0) {
        return res.status(400).json({ error: 'Reports or report IDs are missing' });
    }

    try {
        // Combine reports into a single JSON object
        const combinedReport = { reports };

        // Insert combined report into the reports table
        const insertQuery = 'INSERT INTO reports (title, content) VALUES ($1, $2) RETURNING *';
        const result = await pgClient.query(insertQuery, [client, combinedReport]);

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;