
const pgClient = require('./postgres');

const handleFileUpload = async (req, res, vaId) => {
    const { clientName, organizationName, type, fileContent, filename } = req.body;

    try {
        await pgClient.connect();

        // Fetch client ID based on clientName
        let client_id = null;
        if (clientName) {
            const clientQuery = 'SELECT user_id FROM users WHERE username = $1';
            const clientResult = await pgClient.query(clientQuery, [clientName]);
            client_id = clientResult.rows[0]?.user_id;
        }

        // Fetch organization ID based on organizationName
        let organization_id = null;
        if (organizationName) {
            const orgQuery = 'SELECT organization_id FROM organizations WHERE name = $1';
            const orgResult = await pgClient.query(orgQuery, [organizationName]);
            organization_id = orgResult.rows[0]?.organization_id;
        }
        

        // Create a new large object
        const loCreateQuery = 'SELECT lo_creat(-1)';
        const loCreateResult = await pgClient.query(loCreateQuery);
        const loidValue = loCreateResult.rows[0].lo_creat;

        // Open the large object for writing
        const loOpenQuery = 'SELECT lo_open($1, 131072)';
        await pgClient.query(loOpenQuery, [loidValue]);

        // Write the file content to the large object
        const buffer = Buffer.from(fileContent, 'base64');
        const chunkSize = 16384;
        let offset = 0;
        for (let i = 0; i < buffer.length; i += chunkSize) {
            const chunk = buffer.subarray(i, i + chunkSize);
            await pgClient.query('SELECT lo_put($1, $2, $3)', [loidValue, offset, chunk]);
            offset += chunk.length;
        }

        // Insert into raw_uploads table
        const query = `
            INSERT INTO raw_uploads (va, client, organization, type, loid, filename)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING upload_id`;

        const values = [vaId, client_id, organization_id, type, loidValue, filename];
        const result = await pgClient.query(query, values);
        const uploadId = result.rows[0].upload_id;

        res.status(201).json({ upload_id: uploadId });
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = handleFileUpload;