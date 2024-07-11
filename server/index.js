const pgClient = require('./lib/postgres');
const { authenticateToken, verifyToken } = require('./lib/securityFunctions');
const handleFileUpload = require('./routes/pipe');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Test connection to postgres
pgClient.on('error', err => {
    console.error('Unexpected error on idle client', err);
});

pgClient.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => console.error('Connection error', err.stack));

// Routes
const organizations = require('./routes/organizations');
const users = require('./routes/users');
const authentication = require('./routes/authentication');

app.use(authentication);
app.use(users);
app.use(organizations);



// Get file content in raw_uploads table
app.get('/uploads/file/:loid', authenticateToken, async (req, res) => {
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

app.post('/uploads', authenticateToken, async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decodedToken = verifyToken(token);
    const vaId = decodedToken.user_id;
     
    await handleFileUpload(req, res, pgClient, vaId);
});

//remove file from raw_uploads table
app.delete('/uploads/:upload_id', authenticateToken, async (req, res) => {
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




app.listen(5000, () => {
    console.log('Listening');
});