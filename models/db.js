const config = require('../config/index');

const environment = {
    client: 'mssql',
    connection: {
        host: config.mssql.host,
        user: config.mssql.user,
        password: config.mssql.password,
        database: config.mssql.database,
        timezone: 'UTC',
        pool: {
            min: 5,
            max: 10,
        },
        options: {
            encrypt: true,
            database: config.mssql.database,
        },
    },
};

console.log(environment);

const knexPool = require('knex')(environment);

module.exports = knexPool;
