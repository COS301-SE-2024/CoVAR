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
const dashboard = require('./routes/dashboard');


app.use(authentication);
app.use(users);
app.use(organizations);
app.use(uploads);
app.use(reports);
app.use(dashboard);


app.listen(5000, () => {
    console.log('Listening');
});