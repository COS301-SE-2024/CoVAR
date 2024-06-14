const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

pgClient.on("connect", (client => {
    client
        .query("CREATE TABLE IF NOT EXISTS users (user Text)")
        .catch(err => console.error(err));

    client.query("SELECT NOW()")
        .then(res => console.log('Current time:', res.rows[0].now))
        .catch(err => console.error('Error executing query', err.stack));
}))

// Express route handlers
app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/users/all', async (req, res) => {
    const users = await pgClient.query('SELECT * from users');
    res.send(users.rows);
})

app.post('/users', async (req, res) => {
    const user = req.body.user;
    await pgClient.query('INSERT INTO users VALUES ($1)', [user]);
    res.send({ status: 'success' });
})

app.listen(5000, err => {
    console.log('Listening');
});