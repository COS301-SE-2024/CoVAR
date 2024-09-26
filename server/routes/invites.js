const express = require('express');

const { authenticateToken, verifyToken } = require('../lib/securityFunctions');
const { isOwner,isAdmin } = require('../lib/serverHelperFunctions');

const pgClient = require('../lib/postgres');

const router = express.Router();

// Fetch invites for a user
router.get('/invites/:username', authenticateToken, async (req, res) => {
    const { username } = req.params;

    try {
        // Get the user by username
        const userResult = await pgClient.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult.rows[0].user_id;

        // Fetch invites for the user
        const invitesQuery = `
            SELECT i.invite_id, o.name as organization_name, i.invite_status 
            FROM organization_invites i
            JOIN organizations o ON i.organization_id = o.organization_id
            WHERE i.user_id = $1 AND i.invite_status = 'pending'
        `;
        const invitesResult = await pgClient.query(invitesQuery, [userId]);

        res.json(invitesResult.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Accept invite
router.patch('/invites/:inviteId/accept', authenticateToken, async (req, res) => {
    const { inviteId } = req.params;

    try {
        // Find the invite by inviteId
        const inviteResult = await pgClient.query('SELECT * FROM organization_invites WHERE invite_id = $1', [inviteId]);
        if (inviteResult.rows.length === 0) {
            return res.status(404).send('Invite not found');
        }

        const invite = inviteResult.rows[0];

        // Update the user's organization
        await pgClient.query('UPDATE users SET organization_id = $1 WHERE user_id = $2', [invite.organization_id, invite.user_id]);

        // Update the invite status to accepted
        await pgClient.query('UPDATE organization_invites SET invite_status = $1 WHERE invite_id = $2', ['accepted', inviteId]);

        res.send('Invite accepted successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Reject invite
router.patch('/invites/:inviteId/reject', authenticateToken, async (req, res) => {
    const { inviteId } = req.params;

    try {
        // Find the invite by inviteId
        const inviteResult = await pgClient.query('SELECT * FROM organization_invites WHERE invite_id = $1', [inviteId]);
        if (inviteResult.rows.length === 0) {
            return res.status(404).send('Invite not found');
        }

        // Update the invite status to rejected
        await pgClient.query('UPDATE organization_invites SET invite_status = $1 WHERE invite_id = $2', ['rejected', inviteId]);

        res.send('Invite rejected successfully');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;