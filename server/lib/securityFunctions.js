const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('private.pem', 'utf8');
const publicKey = fs.readFileSync('public.pem', 'utf8');
const refreshPrivateKey = fs.readFileSync('refreshPrivate.pem', 'utf8');
// const refreshPublicKey = fs.readFileSync('refreshPublic.pem', 'utf8');

function generateToken(user) {
    return jwt.sign(user, privateKey, { algorithm: 'RS256', expiresIn: '5s' });
}

function generateRefreshToken(user) {
    return jwt.sign(user, refreshPrivateKey, { algorithm: 'RS256', expiresIn: '7d' });
}

function verifyToken(token) {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            console.log('Token:', token);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
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
    generateToken,
    generateRefreshToken,
    verifyToken,
    authenticateToken,
    verifyIdToken
};
