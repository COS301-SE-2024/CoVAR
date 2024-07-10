const admin = require('firebase-admin');
const serviceAccount = require('./covar-7c8b5-firebase-adminsdk-85918-b6654147c1');
const handleFileUpload = require('./pipe');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function verifyIdToken(idToken) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        throw new Error('Unauthorized');
    }
}
const keys = require('./keys');
const jwtFunctions = require('./jwtFunctions');
const { generateToken, generateRefreshToken, verifyToken, authenticateToken } = jwtFunctions;
const { isOwner } = require('./serverHelperFunctions');


// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});


pgClient.on('error', err => {
    console.error('Unexpected error on idle client', err);
});

pgClient.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => console.error('Connection error', err.stack));

app.use(express.json());

app.post('/checkToken', authenticateToken, (req, res) => {
    res.sendStatus(201);
});

app.post('/users/login', async (req, res) => {
    const { username, firebaseToken } = req.body;

    //firebase login check 
    const decodedToken = await verifyIdToken(firebaseToken);
    console.log(username);
    // make user object out of db entry 
    const userQuery = `SELECT * FROM users WHERE username = $1`;
    const userResult = await pgClient.query(userQuery, [username]);
    if (userResult.rows.length === 0) {
        return res.status(404).send('User not found');
    }
    //check if user is an owner of an organization 
    let isOwnerResult = await isOwner(pgClient, req.body.organization, userResult.rows[0].user_id);
    const user = {
        user_id: userResult.rows[0].user_id,
        username: userResult.rows[0].username,
        role: userResult.rows[0].role,
        organization_id: userResult.rows[0].organization_id,
        owner: isOwnerResult.isOwner
    }
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    res.status(201).json({ accessToken: accessToken, refreshToken: refreshToken });
});

app.post('/users/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);

    jwt.verify(refreshToken, refreshPublicKey, { algorithms: ['RS256'] }, async (err, decoded) => {
        if (err) {
            console.error('Refresh token verification error:', err);
            return res.sendStatus(403);
        }

        try {
            const query = 'SELECT * FROM users WHERE user_id = $1';
            const { rows } = await pgClient.query(query, [decoded.user_id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = {
                user_id: rows[0].user_id,
                username: rows[0].username,
                role: rows[0].role,
                organization_id: rows[0].organization_id,
            };

            const accessToken = generateToken(user);
            res.json({ accessToken });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).send('Server Error');
        }
    });
});

app.post('/users/logout', (req, res) => {
    // Implement logout functionality here
});

app.get('/users/all', authenticateToken, async (req, res) => {
    try {
        const users = await pgClient.query('SELECT * FROM users');
        res.send(users.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Server Error');
    }
});

app.post('/getUser', authenticateToken, async (req, res) => {
    const token = req.body.accessToken;

    try {
        const decodedToken = verifyToken(token);
        //console.log('Decoded token in getUSer:', decodedToken);
        const userId = decodedToken.user_id;

        const userQuery = 'SELECT * FROM users WHERE user_id = $1';
        const userResult = await pgClient.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        let orgName = null;
        let owner = { isOwner: false };

        // Check if the user is associated with an organization
        if (userResult.rows[0].organization_id !== null) {
            const orgQuery = 'SELECT name FROM organizations WHERE organization_id = $1';
            const orgResult = await pgClient.query(orgQuery, [userResult.rows[0].organization_id]);

            if (orgResult.rows.length > 0) {
                orgName = orgResult.rows[0].name;
                // Check if user is an owner of the organization
                owner = await isOwner(pgClient, orgName, userResult.rows[0].user_id);
            } else {
                console.error('Organization not found');
            }
        }

        const user = {
            user_id: userResult.rows[0].user_id,
            username: userResult.rows[0].username,
            role: userResult.rows[0].role,
            organization_id: userResult.rows[0].organization_id,
            orgName: orgName, // Include organization name in response
            owner: owner.isOwner
        };

        res.status(201).json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});



app.post('/users/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);

    jwt.verify(refreshToken, keys.refreshKey, async (err, decoded) => {
        if (err) return res.sendStatus(403);

        try {
            const query = 'SELECT * FROM users WHERE user_id = $1';
            const { rows } = await pool.query(query, [decoded.user_id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = {
                user_id: rows[0].user_id,
                username: rows[0].username,
                role: rows[0].role,
                organization_id: rows[0].organization_id,
            };

            const accessToken = generateToken(user);
            res.json({ accessToken });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).send('Server Error');
        }
    });
});
app.post('/users/logout', (req, res) => {
    // Implement logout functionality here
});
//postgres firebase synch
app.post('/users/create', async (req, res) => {
    const { uid, email } = req.body;
    const role = 'client'; // Default role


    try {
        // Check if user with email already exists
        const checkUserQuery = `
            SELECT * FROM users WHERE username = $1
        `;
        const existingUser = await pgClient.query(checkUserQuery, [email]);

        if (existingUser.rows.length > 0) {
            // User already exists

            return res.status(201).send('User already exists');
        }
        if (existingUser.rows.length === 0) {
            // User does not exist, proceed with insertion
            const insertUserQuery = `
            INSERT INTO users (username, role)
            VALUES ($1, $2)
        `;
            await pgClient.query(insertUserQuery, [email, role]);
            const userQuery = `SELECT * FROM users WHERE username = $1`;
            const userResult = await pgClient.query(userQuery, [email]);
            const user = {
                user_id: userResult.rows[0].user_id,
                username: userResult.rows[0].username,
                role: userResult.rows[0].role,
                organization_id: userResult.rows[0].organization_id,
                owner: false
            }
            const accessToken = generateToken(user);
            const refreshToken = generateRefreshToken(user);
            res.status(201).json({ accessToken: accessToken, refreshToken: refreshToken });
        }
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Server Error');
    }
});

// Test route
app.get('/test', (req, res) => {
    res.send('Test route is working');
});
//Get all organizations
app.get('/organizations/all', authenticateToken, async (req, res) => {
    try {
        const organizations = await pgClient.query('SELECT * FROM organizations');
        res.send(organizations.rows);
    } catch (err) {
        console.error('Error fetching organizations:', err);
        res.status(500).send('Server Error');
    }
});
//create organization
app.post('/organizations/create', authenticateToken, async (req, res) => {
    const { name, username } = req.body;

    // Validate the input
    if (!name || !username) {
        return res.status(400).send('Name and username are required');
    }

    try {
        // Check if organization with name already exists
        const checkOrganizationQuery = `
            SELECT * FROM organizations WHERE name = $1
        `;
        const existingOrganization = await pgClient.query(checkOrganizationQuery, [name]);

        if (existingOrganization.rows.length > 0) {
            // Organization already exists
            return res.status(409).send('Organization already exists');
        }

        // Check if the user exists
        const checkUserQuery = `
            SELECT * FROM users WHERE username = $1
        `;
        const existingUser = await pgClient.query(checkUserQuery, [username]);

        if (existingUser.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        // Organization does not exist, proceed with insertion
        const insertOrganizationQuery = `
            INSERT INTO organizations (name, owner)
            VALUES ($1, $2)
        `;
        await pgClient.query(insertOrganizationQuery, [name, existingUser.rows[0].user_id]);
        //add org id to user table
        const orgIdQuery = `
            SELECT organization_id FROM organizations WHERE name = $1
        `;
        const orgId = await pgClient.query(orgIdQuery, [name]);
        const orgIdValue = orgId.rows[0].organization_id;
        const insertOrgIdQuery = `
            UPDATE users SET organization_id = $1 WHERE username = $2
        `;
        await pgClient.query(insertOrgIdQuery, [orgIdValue, username]);
        res.status(201).send('Organization created successfully');
    } catch (err) {
        console.error('Error creating organization:', err);
        res.status(500).send('Server Error');
    }
});

// Add user to organization
app.post('/organizations/:id/add_user', authenticateToken, async (req, res) => {
    const { id: OwnerId } = req.params;
    const { organizationId, username } = req.body;
    // console.log("owner",OwnerId);
    // console.log("org",organizationId);
    // console.log("username",username);
    try {
        //get org name 
        const orgQuery = `SELECT name FROM organizations WHERE organization_id = $1`;
        const orgResult = await pgClient.query(orgQuery, [organizationId]);
        const OrgName = orgResult.rows[0].name;
        let ownerResult = await isOwner(pgClient, OrgName, OwnerId);
        if (!ownerResult.isOwner) {
            return res.status(error === 'Organization not found' ? 404 : 403).send(error);
        }

        const userResult = await pgClient.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const userInOrgResult = await pgClient.query('SELECT organization_id FROM users WHERE user_id = $1', [userResult.rows[0].user_id]);
        if (userInOrgResult.rows.length > 0 && userInOrgResult.rows[0].organization_id !== null) {
            return res.status(400).send('User already in an organization');
        }

        const userId = userResult.rows[0].user_id;
        await pgClient.query('UPDATE users SET organization_id = $1 WHERE user_id = $2', [organizationId, userId]);

        res.send('User added to organization successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Remove user from organization
app.post('/organizations/:id/remove_user', authenticateToken, async (req, res) => {
    const { id: OwnerId } = req.params;
    const { organizationId, username } = req.body;

    try {
        //get org name
        const orgQuery = `SELECT name FROM organizations WHERE organization_id = $1`;
        const orgResult = await pgClient.query(orgQuery, [organizationId]);
        const OrgName = orgResult.rows[0].name;
        let ownerResult = await isOwner(pgClient, OrgName, OwnerId);
        if (!ownerResult.isOwner) {
            return res.status(error === 'Organization not found' ? 404 : 403).send(error);
        }

        const userResult = await pgClient.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        //if user to be removed is owner dont remove
        if (userResult.rows[0].user_id === OwnerId) {
            return res.status(400).send('Owner cannot be removed');
        }
        const userInOrgResult = await pgClient.query('SELECT organization_id FROM users WHERE user_id = $1', [userResult.rows[0].user_id]);
        if (userInOrgResult.rows.length === 0 || userInOrgResult.rows[0].organization_id !== organizationId) {
            return res.status(400).send('User not in the organization');
        }

        const userId = userResult.rows[0].user_id;
        await pgClient.query('UPDATE users SET organization_id = NULL WHERE user_id = $1', [userId]);

        res.send('User removed from organization successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
//change org name
app.patch('/organizations/:id/change_name', authenticateToken, async (req, res) => {
    const { id: OwnerId } = req.params;
    const { OrgName, newName } = req.body;

    try {
        // Check if the owner is the owner of the organization
        let ownerResult = await isOwner(pgClient, OrgName, OwnerId);
        if (!ownerResult.isOwner) {
            return res.status(error === 'Organization not found' ? 404 : 403).send(error);
        }

        // Check if the new name is already taken
        const existingOrgResult = await pgClient.query('SELECT organization_id FROM organizations WHERE name = $1', [newName]);
        if (existingOrgResult.rows.length > 0) {
            return res.status(409).send('Organization name already taken');
        }

        // Update the organization name
        await pgClient.query('UPDATE organizations SET name = $1 WHERE name = $2', [newName, OrgName]);

        res.send('Organization name changed successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
//fetch users of an org
app.post('/organizations/users', authenticateToken, async (req, res) => {
    //console.log("Getting users from an organization");
    const { org_id } = req.body;
    try {
        const users = await pgClient.query('SELECT * FROM users WHERE organization_id = $1', [org_id]);
        res.send(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
//fetch org of a user
app.get('/users/:id/organization', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const org = await pgClient.query('SELECT * FROM organizations WHERE organization_id = (SELECT organization_id FROM users WHERE user_id = $1)', [id]);
        res.send(org.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Update user role
app.patch('/users/:id/role', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        // Using parameterized query to prevent SQL injection
        const queryText = 'UPDATE users SET role = $1 WHERE user_id = $2';
        await pgClient.query(queryText, [role, id]);
        res.send('User role updated successfully');
    } catch (err) {
        console.error('Error updating user role:', err.message);
        res.status(500).send('Server Error');
    }
});


// Assign a client to a VA
app.post('/users/:id/assign', authenticateToken, async (req, res) => {
    
    const { id } = req.params; // VA id
    const { clientUsername } = req.body;
    

    try {
        // Check if the clientUsername is an organization
        const organizationResult = await pgClient.query('SELECT organization_id FROM organizations WHERE name = $1', [clientUsername]);
        if (organizationResult.rows.length > 0) {
            const organizationId = organizationResult.rows[0].organization_id;
            
            await pgClient.query('INSERT INTO assignment (va, organization) VALUES ($1, $2)', [id, organizationId]);
            return res.send('Organization assigned successfully');
        }

        // If not an organization, check if the clientUsername is a normal user
        const clientResult = await pgClient.query('SELECT user_id FROM users WHERE username = $1', [clientUsername]);
        if (clientResult.rows.length === 0) {
            return res.status(404).send('Client not found');
        }

        const clientId = clientResult.rows[0].user_id;
        
        await pgClient.query('INSERT INTO assignment (va, client) VALUES ($1, $2)', [id, clientId]);
        res.send('Client assigned successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Get all clients assigned to a VA
app.get('/users/:id/assigned_clients', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const clients = await pgClient.query('SELECT * FROM users WHERE user_id IN (SELECT client FROM assignment WHERE va = $1)', [id]);
        res.send(clients.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
);

// Get all organizations assigned to a VA
app.get('/users/:id/assigned_organizations', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const organizations = await pgClient.query('SELECT * FROM organizations WHERE organization_id IN (SELECT organization FROM assignment WHERE va = $1)', [id]);
        
        res.send(organizations.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
);

// Get all clients assigned to logged in VA
app.get('/users/assigned_clients', authenticateToken, async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decodedToken = verifyToken(token);
    const id = decodedToken.user_id;
    
    try {
        const clients = await pgClient.query('SELECT * FROM users WHERE user_id IN (SELECT client FROM assignment WHERE va = $1)', [id]);
        res.send(clients.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all organizations assigned to logged in VA
app.get('/users/assigned_organizations', authenticateToken, async (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    const decodedToken = verifyToken(token);
    const id = decodedToken.user_id;
    try {
        const organizations = await pgClient.query('SELECT * FROM organizations WHERE organization_id IN (SELECT organization FROM assignment WHERE va = $1)', [id]);
        
        res.send(organizations.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// Unassign a client or organization from a VA
app.post('/users/:id/unassign', authenticateToken, async (req, res) => {
    const { id } = req.params; // user_id
    const { clientUsername } = req.body;
    try {
        // Check if the clientUsername is an organization
        const organizationResult = await pgClient.query('SELECT organization_id FROM organizations WHERE name = $1', [clientUsername]);
        if (organizationResult.rows.length > 0) {
            const organizationId = organizationResult.rows[0].organization_id;
            await pgClient.query('DELETE FROM assignment WHERE va = $1 AND organization = $2', [id, organizationId]);
            return res.send('Organization unassigned successfully');
        }

        // If not an organization, check if the clientUsername is a normal user
        const clientResult = await pgClient.query('SELECT user_id FROM users WHERE username = $1', [clientUsername]);
        if (clientResult.rows.length === 0) {
            return res.status(404).send('Client not found');
        }

        const clientId = clientResult.rows[0].user_id;
        await pgClient.query('DELETE FROM assignment WHERE va = $1 AND client = $2', [id, clientId]);
        res.send('Client unassigned successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


// Get all uploads for a specific client assigned to logged in VA
app.get('/uploads/client/:clientName', authenticateToken, async (req, res) => {
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
// Get all uploads for a specific organization assigned to logged in VA
app.get('/uploads/organization/:organizationName', authenticateToken, async (req, res) => {
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




app.listen(5000, err => {
    console.log('Listening');
});