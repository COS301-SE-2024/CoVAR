const express = require('express');
const { authenticateToken, generateToken, verifyToken, generateRefreshToken } = require('../lib/securityFunctions');
const { isOwner,isAdmin } = require('../lib/serverHelperFunctions');
const pgClient = require('../lib/postgres');

const router = express.Router();

router.get('/users/all', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const adminResult =  await isAdmin(pgClient,userId);
        if(!adminResult.isAdmin){
            return res.status(403).send('Not authorized as admin');
        }
        const users = await pgClient.query("SELECT u.user_id, u.username, u.role, o.name AS organization FROM users u LEFT JOIN organizations o ON u.organization_id = o.organization_id;");
        res.send(users.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/getUser', authenticateToken, async (req, res) => {
    console.log('Getting user');
    const token = req.body.accessToken;
    if(!token){
        return res.status(400).send('Token is required');
    }
    try {
        console.log('Token:', token);
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
    const role = 'unauthorised'; // Default role
    if(!email){
        return res.status(400).send('Email is required');
    }
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
        const refreshToken = generateRefreshToken(user);
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
    if(!id){
        return res.status(400).send('User id is required');
    }  
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
    if(!id || !role){
        return res.status(400).send('User id and role are required');
    }
    try {
        const userId = req.user.user_id;
        const adminResult =  await isAdmin(pgClient,userId);
        if(!adminResult.isAdmin){
            return res.status(403).send('Not authorized as admin');
        }
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
router.post('/users/:id/assign', authenticateToken, async (req, res) => {
    console.log('Assigning a client to a VA');
    const { id } = req.params; // VA id
    const { clientUsername } = req.body;
    console.log('clientUsername:', clientUsername);
    
    if (!id || !clientUsername) {
        return res.status(400).send('User id and clientUsername are required');
    }

    try {
        const userId = req.user.user_id;
        const adminResult = await isAdmin(pgClient, userId);
        if (!adminResult.isAdmin) {
            return res.status(403).send('Not authorized as admin');
        }

        // Check if the clientUsername is an organization
        const organizationResult = await pgClient.query('SELECT organization_id FROM organizations WHERE name = $1', [clientUsername]);
        if (organizationResult.rows.length > 0) {
            const organizationId = organizationResult.rows[0].organization_id;
            console.log('Assigning an organization to the VA');

            // Check if the organization is already assigned
            const organizationCheck = await pgClient.query('SELECT * FROM assignment WHERE va = $1 AND organization = $2', [id, organizationId]);
            if (organizationCheck.rows.length > 0) {
                return res.status(409).send('Organization is already assigned to this VA');
            }

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

        // Check if the client is already assigned
        const clientCheck = await pgClient.query('SELECT * FROM assignment WHERE va = $1 AND client = $2', [id, clientId]);
        if (clientCheck.rows.length > 0) {
            return res.status(409).send('Client is already assigned to this VA');
        }

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
    if(!id){
        return res.status(400).send('User id is required');
    }
    try {
        const userId = req.user.user_id;
        const adminResult =  await isAdmin(pgClient,userId);
        if(!adminResult.isAdmin){
            return res.status(403).send('Not authorized as admin');
        }
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
    if(!id){
        return res.status(400).send('User id is required');
    }
    try {
        const userId = req.user.user_id;
        const adminResult =  await isAdmin(pgClient,userId);
        if(!adminResult.isAdmin){
            return res.status(403).send('Not authorized as admin');
        }
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
    if(!id || !clientUsername){
        return res.status(400).send('User id and clientUsername are required');
    }
    try {
        const userId = req.user.user_id;
        const adminResult =  await isAdmin(pgClient,userId);
        if(!adminResult.isAdmin){
            return res.status(403).send('Not authorized as admin');
        }
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

// Endpoint to search for unauthorized users
router.get('/users/unauthorized', authenticateToken, async (req, res) => {
    const search = req.query.search || '';
    try {
        const unauthorizedUsers = await pgClient.query(
            'SELECT * FROM users WHERE role = $1 AND username ILIKE $2', 
            ['unauthorised', `%${search}%`]
        );
        res.send(unauthorizedUsers.rows);
    } catch (err) {
        console.error('Error fetching unauthorized users:', err);
    }
});



// Endpoint to change role from unauthorized to client using username
router.patch('/users/authorize', authenticateToken, async (req, res) => {
    const { username } = req.body;
    try {
        // Check if the user exists and has the role 'unauthorised'
        const userQuery = 'SELECT * FROM users WHERE username = $1';
        const userResult = await pgClient.query(userQuery, [username]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = userResult.rows[0];
        
        if (user.role !== 'unauthorised') {
            return res.status(400).send('User is not unauthorised');
        }

        // Update user role to 'client'
        const updateUserRoleQuery = 'UPDATE users SET role = $1 WHERE username = $2 AND role = $3';
        await pgClient.query(updateUserRoleQuery, ['client', username, 'unauthorised']);
        res.send('User role updated to client successfully');
    } catch (err) {
        console.error('Error updating user role:', err);
    }
});

// Get all clients assigned to logged in VA
router.get('/users/assigned_clients', authenticateToken, async (req, res) => {
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

// Check if email exists in the database
router.post('/users/checkEmailExists', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send('Email is required');
    }
    try {
        // Query the database to see if the email exists
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pgClient.query(query, [email]);
        
        if (result.rows.length === 0) {
            // Email not found
            return res.status(404).send('Email not found');
        }
        // Email found
        res.status(200).send('Email exists');
    } catch (err) {
        console.error('Error checking email:', err);
        res.status(500).send('Server Error');
    }
});



module.exports = router;