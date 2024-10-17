const jwt = require('jsonwebtoken');
const pgClient = require('../lib/postgres');
const fs = require('fs');
const { isVA , isClient ,isAdmin,isUnauthorised} = require('../lib/serverHelperFunctions');
const privateKey = fs.readFileSync('private.pem', 'utf8');
const publicKey = fs.readFileSync('public.pem', 'utf8');
const refreshPrivateKey = fs.readFileSync('refreshPrivate.pem', 'utf8');
// const refreshPublicKey = fs.readFileSync('refreshPublic.pem', 'utf8');

function generateToken(user) {
    return jwt.sign(user, privateKey, { algorithm: 'RS256', expiresIn: '5min' });
}

function generateRefreshToken(user) {
    return jwt.sign(user, refreshPrivateKey, { algorithm: 'RS256', expiresIn: '7d' });
}

function verifyToken(token) {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
}
async function authenticateWhiteList(req, res, next){
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401); // No token, unauthorized

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, async (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            console.log('Token:', token);
            return res.sendStatus(403); // Token invalid, forbidden
        }
        
        req.user = user; // Store the user info in the request
        const userId = req.user.user_id;

        try {
            // Await all the role checks
            const UnauthResult = await isUnauthorised(pgClient, userId);
            // Check if the user is a VA, client, or admin
            if (UnauthResult.isUnauthorised ) {
                // If any of the checks pass, continue to the next middleware or route
                return next();
            } else {
                // If none of the checks pass, send a 403 Forbidden response
                return res.status(403).send('Not authorized');
            }
        } catch (error) {
            console.error('Error during role checks:', error);
            return res.status(500).send('Server Error'); // Handle any errors from the role checks
        }
    });
}
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401); // No token, unauthorized

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, async (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            console.log('Token:', token);
            return res.sendStatus(403); // Token invalid, forbidden
        }
        
        req.user = user; // Store the user info in the request
        const userId = req.user.user_id;

        try {
            // Await all the role checks
            const VAResult = await isVA(pgClient, userId);
            const clientResult = await isClient(pgClient, userId);
            const adminResult = await isAdmin(pgClient, userId);

            // Check if the user is a VA, client, or admin
            if (VAResult.isVA || clientResult.isClient || adminResult.isAdmin) {
                // If any of the checks pass, continue to the next middleware or route
                return next();
            } else {
                // If none of the checks pass, send a 403 Forbidden response
                return res.status(403).send('Not authorized');
            }
        } catch (error) {
            console.error('Error during role checks:', error);
            return res.status(500).send('Server Error'); // Handle any errors from the role checks
        }
    });
}


// Firebase sdk
const admin = require('firebase-admin');
const serviceAccount = require('../covar-7c8b5-firebase-adminsdk-85918-b6654147c1');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function verifyIdToken(req,res,next) {
    const idToken = req.body.firebaseToken;
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      return res.sendStatus(403);
    }
    
}

module.exports = {
    authenticateWhiteList,
    generateToken,
    generateRefreshToken,
    verifyToken,
    authenticateToken,
    verifyIdToken
};
