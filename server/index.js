const admin = require('firebase-admin');
const serviceAccount = require('./covar-7c8b5-firebase-adminsdk-85918-b6654147c1');

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

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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
function generateToken(user){
    return jwt.sign(user,keys.jsonKey,{expiresIn:'15 m'});
}
function authenticateToken(req,res,next){
    console.log("authenticating");
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);
    jwt.verify(token,keys.jsonKey,(err,user)=>{
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

async function isOwner(pgClient, OrgName, OwnerId) {
    const ownerResult = await pgClient.query('SELECT owner FROM organizations WHERE name = $1', [OrgName]);
    if (ownerResult.rows.length === 0) {
        return { isOwner: false, error: 'Organization not found' };
    }
    
    if (ownerResult.rows[0].owner !== OwnerId) {
        return { isOwner: false, error: 'Not authorized as owner of the organization' };
    }
    
    return { isOwner: true };
}
// Express route handlers

app.get('/users/all', authenticateToken,async (req, res) => {
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
        const decodedToken = jwt.verify(token, keys.jsonKey);
        const userId = decodedToken.user_id;
        console.log("getUser");
        console.log(userId);

        const userQuery = `SELECT * FROM users WHERE user_id = $1`;
        const userResult = await pgClient.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = {
            user_id: userResult.rows[0].user_id,
            username: userResult.rows[0].username,
            role: userResult.rows[0].role,
            organization_id: userResult.rows[0].organization_id
        };
        console.log("getUser");
        console.log(userResult.rows[0]);
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/users/login', async (req, res) => {
   const username=req.body.username;
   const firebasekey=req.body.firebaseToken;
   //firebase login check 
    const decodedToken = await verifyIdToken(firebasekey);
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
   const refreshToken = jwt.sign(user,keys.refreshKey);
   res.json({accessToken: accessToken,refreshToken:refreshToken});
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
            return res.send('User already exists');
        }
        if(existingUser.rows.length === 0){
        // User does not exist, proceed with insertion
        const insertUserQuery = `
            INSERT INTO users (username, role)
            VALUES ($1, $2)
        `;
        await pgClient.query(insertUserQuery, [email, role]);
        
        res.status(201).send('User created successfully');
        }
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Server Error');
    }
});

//Get all organizations
app.get('/organizations/all', authenticateToken,async (req, res) => {
    try {
        const organizations = await pgClient.query('SELECT * FROM organizations');
        res.send(organizations.rows);
    } catch (err) {
        console.error('Error fetching organizations:', err);
        res.status(500).send('Server Error');
    }
});


// Update user role
app.patch('/users/:id/role', authenticateToken,async (req, res) => {
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
app.post('/users/:id/assign', authenticateToken,async (req, res) => {
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
app.get('/users/:id/assigned_clients' , authenticateToken,async (req, res) => {
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
app.get('/users/:id/assigned_organizations' , authenticateToken,async (req, res) => {
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
app.post('/users/:id/unassign', authenticateToken,async (req, res) => {
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