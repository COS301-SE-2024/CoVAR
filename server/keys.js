module.exports = {
    pgUser: process.env.PG_USER,
    pgHost: process.env.PG_HOST,
    pgDatabase: process.env.PG_DATABASE,
    pgPassword: process.env.PG_PASSWORD,
    pgPort: process.env.PG_PORT,
    jsonKey: process.env.JSON_SECRET,
    refreshKey: process.env.REFRESH_SECRET
}