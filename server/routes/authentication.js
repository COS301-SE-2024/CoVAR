const express = require('express');
const { verifyIdToken, generateToken, generateRefreshToken, authenticateToken } = require('../lib/securityFunctions');
const { isOwner } = require('../lib/serverHelperFunctions');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const pgClient = require('../lib/postgres');

const router = express.Router();

router.post('/checkToken',authenticateToken,(req,res)=>{
    res.sendStatus(201);
});

router.post('/users/login',verifyIdToken ,async (req, res) => {
    const { username} = req.body;

    //firebase login check 
    //await verifyIdToken(firebaseToken);
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
    res.status(201).json({accessToken: accessToken,refreshToken:refreshToken});
});

const refreshPublicKey = fs.readFileSync('refreshPublic.pem', 'utf8');
router.post('/users/token', (req, res) => {
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

module.exports = router;