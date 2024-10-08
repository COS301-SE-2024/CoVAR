const pgClient = require('./lib/postgres');


// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb', extended: true }))

// Test connection to postgres
pgClient.on('error', err => {
    console.error('Unexpected error on idle client', err);
});

pgClient.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => console.error('Connection error', err.stack));

// Routes
const organizations = require('./routes/organizations');
const users = require('./routes/users');
const authentication = require('./routes/authentication');
const uploads = require('./routes/uploads');

const reports = require('./routes/reports');

const conflicts = require('./routes/conflicts');

const dashboard = require('./routes/dashboard');

const chain = require('./routes/chain');

const invites = require('./routes/invites');


app.use(chain);
app.use(authentication);
app.use(users);
app.use(organizations);
app.use(uploads);
app.use(reports);
app.use(conflicts);
app.use(dashboard);
app.use(invites);

app.listen(5000, () => {
    console.log('Listening');
});