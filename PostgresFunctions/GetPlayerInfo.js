/**
 * Created by michaell on 3/15/17.
 */

var config = require('./PostgresConfig');
var SqlString = require('sqlstring');

function getPlayerInfo(context, callbackFunc) {
    if (!context.entities.player) {
        callbackFunc("I think you forgot or misspelled a name!");
        return;
    }

    if (!context.entities.playerInfoToGet) {
        callbackFunc("I think you forgot some info to get about the player");
        return;
    }
    const name = context.entities.player[0].value;
    const player_info = context.entities.playerInfoToGet[0].value;

    getPlayerInfoPromise(name).then(function (rows) {
        if (rows && rows[0]) {
            var data = rows[0][player_info];
            callbackFunc(getPlayerInfoString(name, data, player_info));
        } else {
            console.log(rows)
            callbackFunc('Sorry, we couldn\'t find anything');
        }
    })

}

function getPlayerInfoPromise(name){
    var query = 'select * from GetPlayerInfo(';
    query += SqlString.escape(name);
    query += ');';

    console.log(query);
    return config.executePostgresQuery(query);
}

function getPlayerInfoString(name, data, player_info) {
    var return_string = name + ' '
    if(player_info=='weight'){
        return_string += 'weighs ' + data + ' pounds.'
    } else if(player_info=='years_pro'){
        return_string += 'has been in the NFL for ' + data + ' years.'
    } else if(player_info=='age'){
        return_string += 'is ' + _calculateAge(new Date(Date.parse("8/3/1977"))) + ' years old.'
    } else if(player_info=='player_position'){
        return_string += 'plays ' + data
    } else if(player_info=='team'){
        return_string += 'plays for ' + data
    } else if(player_info=='height_inches'){
        // TODO Convert to feet
        return_string += 'is ' + _convertHeight(data)
    } else if(player_info=='uniform_number'){
        return_string += ' is number ' + data
    }

    return return_string;
}

module.exports = {
    getPlayerInfo: getPlayerInfo
}

function _calculateAge(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function _convertHeight(inches) {
    var return_height = Math.trunc(inches/12) + ' ft '
    return_height += inches%12 + ' inches '
    return return_height;
}


