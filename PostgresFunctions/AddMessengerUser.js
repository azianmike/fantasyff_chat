/**
 * Created by michaell on 2/14/17.
 */

var config = require('./PostgresConfig');

function addMessengerUser(messengerUser){
    var sqlString = "select AddMessengerUser("+messengerUser+");";
    config.executePostgresQuery(sqlString).then({
        function(temp){
            // Finish adding messenger user
        }
    });
}


module.exports = {
    addMessengerUser: addMessengerUser
}

// getCurrentWeekPromise();