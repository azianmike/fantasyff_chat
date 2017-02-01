/**
 * Created by michaell on 1/28/17.
 */
Promise = require('bluebird')
var pg = Promise.promisifyAll(require("pg"));

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
// instantiate a new client
// the client will read connection information from
// the same environment variables used by postgres cli tools
    var pool = Promise.promisifyAll(new pg.Pool(config));

    // var transaction = function () {
    //     return Promise.using(pool.connect(), function ( connection) {
    //         return Promise.try(function() {
    //             return connection.queryAsync(query).then(
    //                     function (result) {
    //                         //output: 1
    //                         pool.end();
    //                         connection.end();
    //                         return result.rows;
    //                     }
    //                 )
    //         });
    //     });
    //
    //
    // };
    return pool.query(query); // output: foo
// return transaction();
}

module.exports = {
    executePostgresQuery: executePostgresQuery
}
