const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: 5432
});


pgClient.on('error', err => {
    console.error('Unexpected error on idle client', err);
});

pgClient.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => console.error('Connection error', err.stack));

app.use(express.json());

// Express route handlers

app.get('/users/all', async (req, res) => {
    try {
        const users = await pgClient.query('SELECT * FROM users');
        res.send(users.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Server Error');
    }
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
            return res.status(409).send('User already exists');
        }

        // User does not exist, proceed with insertion
        const insertUserQuery = `
            INSERT INTO users (username, role)
            VALUES ($1, $2)
        `;
        await pgClient.query(insertUserQuery, [email, role]);

        res.status(201).send('User created successfully');
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
app.get('/organizations/all', async (req, res) => {
    try {
        const organizations = await pgClient.query('SELECT * FROM organizations');
        res.send(organizations.rows);
    } catch (err) {
        console.error('Error fetching organizations:', err);
        res.status(500).send('Server Error');
    }
});
//create organization
app.post('/organizations/create', async (req, res) => {
    const { name, email } = req.body;

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

        // Organization does not exist, proceed with insertion
        const insertOrganizationQuery = `
            INSERT INTO organizations (name, email)
            VALUES ($1, $2)
        `;
        await pgClient.query(insertOrganizationQuery, [name, email]);

        res.status(201).send('Organization created successfully');
    } catch (err) {
        console.error('Error creating organization:', err);
        res.status(500).send('Server Error');
    }
});
//add user to organization
app.post('/organizations/:id/add_user', async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try {
        // Check if the user exists
        const userResult = await pgClient.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult.rows[0].user_id;
        await pgClient.query('INSERT INTO organization_users (organization, user_id) VALUES ($1, $2)', [id, userId]);
        res.send('User added to organization successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update user role
app.patch('/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const queryText = `UPDATE users SET role = '${role}' WHERE user_id = '${id}'`;
        await pgClient.query(queryText);
        res.send('User role updated successfully');
        
    } catch (err) {
        console.error('Error updating user role:', err.message);
        res.status(500).send('Server Error');
    }
});

// Assign a client to a VA
app.post('/users/:id/assign', async (req, res) => {
    const { id } = req.params; // VA id
    const { clientUsername } = req.body;
    console.log('clientUsername:', clientUsername);

    try {
        // Check if the clientUsername is an organization
        const organizationResult = await pgClient.query('SELECT organization_id FROM organizations WHERE name = $1', [clientUsername]);
        if (organizationResult.rows.length > 0) {
            const organizationId = organizationResult.rows[0].organization_id;
            console.log('Assigning an organization to the VA');
            await pgClient.query('INSERT INTO assignment (va, organization) VALUES ($1, $2)', [id, organizationId]);
            return res.send('Organization assigned successfully');
        }

        // If not an organization, check if the clientUsername is a normal user
        const clientResult = await pgClient.query('SELECT user_id FROM users WHERE username = $1', [clientUsername]);
        if (clientResult.rows.length === 0) {
            return res.status(404).send('Client not found');
        }

        const clientId = clientResult.rows[0].user_id;
        console.log('Assigning a normal client to the VA');
        await pgClient.query('INSERT INTO assignment (va, client) VALUES ($1, $2)', [id, clientId]);
        res.send('Client assigned successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Get all clients assigned to a VA
app.get('/users/:id/assigned_clients' , async (req, res) => {
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
app.get('/users/:id/assigned_organizations' , async (req, res) => {
    const { id } = req.params;
    try {
        const organizations = await pgClient.query('SELECT * FROM organizations WHERE organization_id IN (SELECT organization FROM assignment WHERE va = $1)', [id]);
        console.log(organizations.rows);
        res.send(organizations.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
);



// Unassign a client or organization from a VA
app.post('/users/:id/unassign', async (req, res) => {
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


app.listen(5000, err => {
    console.log('Listening');
});