const express = require('express');

const { authenticateToken, verifyToken } = require('../lib/securityFunctions');
const { isOwner,isAdmin } = require('../lib/serverHelperFunctions');

const pgClient = require('../lib/postgres');

const router = express.Router();

//Get all organizations
router.get('/organizations/all', authenticateToken,async (req, res) => {
    try {
        const userId = req.user.user_id;
        const adminResult =  await isAdmin(pgClient,userId);
        if(!adminResult.isAdmin){
            return res.status(403).send('Not authorized as admin');
        }
        const organizations = await pgClient.query('SELECT * FROM organizations');
        res.send(organizations.rows);
    } catch (err) {
        console.error('Error fetching organizations:', err);
        res.status(500).send('Server Error');
    }
});

//Create organization
router.post('/organizations/create',authenticateToken, async (req, res) => {
    const { name, username } = req.body;
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
router.post('/organizations/:id/add_user',  authenticateToken, async (req, res) => {
    const { id: OwnerId } = req.params;
    const { organizationId, username } = req.body;

    try {
        //get org name 
        const orgQuery = `SELECT name FROM organizations WHERE organization_id = $1`;
        const orgResult = await pgClient.query(orgQuery, [organizationId]);
        const OrgName = orgResult.rows[0].name;
        let ownerResult = await isOwner(pgClient, OrgName, OwnerId);
        if (!ownerResult.isOwner) {
            return res.status(ownerResult.error === 'Organization not found' ? 404 : 403).send(ownerResult.error);
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
router.post('/organizations/:id/remove_user',  authenticateToken , async (req, res) => {
    const { id: OwnerId } = req.params;
    const { organizationId,  username } = req.body;
    
    try {
        //Get org name
        const orgQuery = `SELECT name FROM organizations WHERE organization_id = $1`;
        const orgResult = await pgClient.query(orgQuery, [organizationId]);
        const OrgName = orgResult.rows[0].name;
        let ownerResult = await isOwner(pgClient, OrgName, OwnerId);
        if (!ownerResult.isOwner) {
            return res.status(ownerResult.error === 'Organization not found' ? 404 : 403).send(ownerResult.error);
        }

        const userResult = await pgClient.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }
        //If user to be removed is owner dont remove
        if(userResult.rows[0].user_id === OwnerId){
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

// Change org name
router.patch('/organizations/:id/change_name', authenticateToken , async (req, res) => {
    const { id: OwnerId } = req.params;
    const { OrgName, newName } = req.body;

    try {
        // Check if the owner is the owner of the organization
        let ownerResult = await isOwner(pgClient, OrgName, OwnerId);
        if (!ownerResult.isOwner) {
            return res.status(ownerResult.error === 'Organization not found' ? 404 : 403).send(ownerResult.error);
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
router.post('/organizations/users',  authenticateToken ,async (req, res) => {
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



// Get all organizations assigned to logged in VA
router.get('/users/assigned_organizations', authenticateToken, async (req, res) => {
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


// Leave organization
router.post('/organizations/leave', authenticateToken, async (req, res) => {
    const { organizationId, username } = req.body;

    try {
        const userQuery = 'SELECT user_id, organization_id FROM users WHERE username = $1';
        const userResult = await pgClient.query(userQuery, [username]);

        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult.rows[0].user_id;

        if (userResult.rows[0].organization_id !== organizationId) {
            return res.status(400).send('User is not part of the specified organisation');
        }

        // Ensure user is not the owner
        const orgQuery = 'SELECT owner FROM organizations WHERE organization_id = $1';
        const orgResult = await pgClient.query(orgQuery, [organizationId]);

        if (orgResult.rows.length === 0) {
            return res.status(404).send('Organisation not found');
        }

        if (orgResult.rows[0].owner === userId) {
            return res.status(400).send('Owner cannot leave the organisation');
        }

        await pgClient.query('UPDATE users SET organization_id = NULL WHERE user_id = $1', [userId]);

        res.send('User left the organisation successfully');
    } catch (err) {
        console.error('Error leaving organization:', err);
        res.status(500).send('Server Error');
    }
});

// Delete organization (remove all users from the organization)
router.delete('/organizations/:orgId/delete', authenticateToken, async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(403).json({ error: 'No access token provided' });
        }

        const decodedToken = verifyToken(accessToken); 
        const userId = decodedToken.user_id;

        const { orgId } = req.params;

        // Fetch the organization and check if the requesting user is the owner
        const orgQuery = 'SELECT * FROM organizations WHERE organization_id = $1';
        const organization = await pgClient.query(orgQuery, [orgId]);

        if (organization.rows.length === 0) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Check if the user is the owner of the organization
        if (organization.rows[0].owner !== userId) {
            return res.status(403).json({ error: 'Only the owner can remove users from the organization' });
        }

        // Remove all users from the organization
        await pgClient.query('UPDATE users SET organization_id = NULL WHERE organization_id = $1', [orgId]);

        return res.status(200).json({ message: 'All users removed from the organization successfully' });
    } catch (error) {
        console.error('Error deleting organization:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;