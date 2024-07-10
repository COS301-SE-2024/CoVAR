const express = require('express');
const { authenticateToken, generateToken, verifyToken } = require('../lib/securityFunctions');
const { isOwner } = require('../lib/serverHelperFunctions');
const pgClient = require('../lib/postgres');
const jwt = require('jsonwebtoken');
const keys = require('../keys');

const router = express.Router();

router.get('/users/all', authenticateToken, async (req, res) => {
    try {
        const users = await pgClient.query('SELECT * FROM users');
        res.send(users.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/getUser', authenticateToken, async (req, res) => {
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

//postgres firebase synch
router.post('/users/create', async (req, res) => {
    const { email } = req.body;
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
        if(existingUser.rows.length === 0){
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
        const refreshToken = jwt.sign(user, keys.refreshKey);
        res.status(201).json({accessToken: accessToken,refreshToken:refreshToken});
        }
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Server Error');
    }
});

//fetch org of a user
router.get('/users/:id/organization', authenticateToken ,async (req, res) => {
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
router.patch('/users/:id/role', authenticateToken ,async (req, res) => {
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
router.post('/users/:id/assign', authenticateToken ,async (req, res) => {
    console.log('Assigning a client to a VA');
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
router.get('/users/:id/assigned_clients' , authenticateToken ,async (req, res) => {
    const { id } = req.params;
    try {
        const clients = await pgClient.query('SELECT * FROM users WHERE user_id IN (SELECT client FROM assignment WHERE va = $1)', [id]);
        res.send(clients.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all organizations assigned to a VA
router.get('/users/:id/assigned_organizations' , authenticateToken ,async (req, res) => {
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
router.post('/users/:id/unassign', authenticateToken,async (req, res) => {
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

module.exports = router;