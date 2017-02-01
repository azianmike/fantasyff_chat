/**
 * Created by michaell on 1/28/17.
 */
Promise = require('bluebird')
var pg = require('pg');

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
    user: 'nfldb', //env var: PGUSER
    database: 'nfldb', //env var: PGDATABASE
    password: '!!@@##$$', //env var: PGPASSWORD
    host: 'localhost', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

function executePostgresQuery(query) {
    var pool = Promise.promisifyAll(new pg.Pool(config));

// to run a query we can acquire a client from the pool,
// run a query on the client, and then return the client to the pool

    return pool.query(query); // output: foo
}

module.exports = {
    executePostgresQuery: executePostgresQuery
}
