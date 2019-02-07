require('dotenv').config();

const environment = {
    client: 'mssql',
    connection: {
        host: process.env.MSSQL_HOST,
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        database: process.env.MSSQL_DB,
        timezone: 'UTC',
        pool: {
            min: 5,
            max: 10,
        },
        options: {
            encrypt: true,
            database: process.env.MSSQL_DB,
        },
    },
};

const knexPool = require('knex')(environment);

module.exports = knexPool;
