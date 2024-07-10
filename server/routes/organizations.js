const express = require('express');
const { authenticateToken } = require('../lib/securityFunctions');
const { isOwner } = require('../lib/serverHelperFunctions');
const pgClient = require('../lib/postgres');

const router = express.Router();

//Get all organizations
router.get('/organizations/all', authenticateToken,async (req, res) => {
    try {
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

module.exports = router;