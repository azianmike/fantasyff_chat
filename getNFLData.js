/**
 * Created by michaell on 12/11/16.
 */

var http = require('http');
var parser = require('xml2json');  // Convert NFL.com xml to json
var util = require('util')

/**
 * Gets live NFL data from nfl.com and then performs a function on the JSON data
 * @param functionToCall function to call after getting JSON data
 */
function getLiveNFLData(){
    var options = {
        host: 'www.nfl.com',
        port: 80,
        path: '/liveupdate/scorestrip/ss.json'
    };

    return options
}

/**
 * Parse nfl game data and call funcToCall
 * @param jsonResult the json result of the NFL.com api call
 * @param teamName team name that we want to get the score of
 * @param funcToCall has to take a formatted string (for message to send back)
 */
function parseNFLGameData(jsonResult, teamName, funcToCall) {
// The JSON result for games
    var games = jsonResult.gms
    for (var game in games) {  // Loop through games to match team names
        var gameObj = games[game]
        if (gameObj.vnn.toLowerCase() === teamName.toLowerCase() || gameObj.hnn.toLowerCase() === teamName.toLowerCase()) {
            if (gameObj.q.toLowerCase() === 'p' && jsonResult.w > 1)  // P means yet to play, F means final, FO means overtime
            {
                //Yet to play this week, get historical score
                getTeamHistoricalScore(teamName, jsonResult.w-1, funcToCall )
                break;
            }
            var formattedString = "Score is " + gameObj.vnn + "-" + gameObj.vs + " to " + gameObj.hnn + "-" + gameObj.hs
            formattedString += " for week " + jsonResult.w
            if (funcToCall)  // Check if null
            {
                funcToCall(formattedString)
            }
            else {
                console.log("FuncToCall is null")
            }

            break;
        }
    }}

/**
 * Gets a team's live score given a name
 * @param teamName name of team to get score of
 * @param callback function after getting the team score
 */
function getTeamLiveScore( teamName, funcToCall )
{
    http.get(getLiveNFLData(), function(resp){
        if( this.path != getLiveNFLData().path )  // Case where the callback func stays attached for future http calls
        {
            console.log("Wrong path for getTeamLiveScore")
            return;
        }
        var retry = false  // Flag for recursive retry hell
        resp.setEncoding('utf8');
        if( resp.statusCode == 200 && !retry ) {
            resp.on('data', function (chunk) {
                // Parses the JSON data
                if( !retry ) {  // Retry because the anonymous function stays "attached" to http.get. i.e. multiple retries means multiple of this func
                    try {
                        var jsonResult = JSON.parse(chunk);
                    } catch (err) {
                        retry = true;  // Retry if parsing error
                        getTeamLiveScore(teamName, funcToCall)
                        return;
                    }

                    parseNFLGameData(jsonResult, teamName, funcToCall);
                }

            });
        }
    }).on("error", function(e){
        console.log("Got error: " + e.message);
    });
}

/**
 * Gets the historical score for the team (for past weeks)
 * @param teamName team to get score of
 * @param week week to get game of
 * @param funcToCall callback function
 */
function getTeamHistoricalScore( teamName, week, funcToCall )
{
    http.get(getHistoricalNFLData( week ), function(resp){
        if( this.path != getHistoricalNFLData(week).path )  // Case where the callback func stays attached for future http calls
        {
            return;
        }
        var retry = false  // Flag for recursive retry hell
        resp.setEncoding('utf8');
        if( resp.statusCode == 200 && !retry ) {
            resp.on('data', function (chunk) {
                // Parses the JSON data
                if( !retry ) {  // Retry because the anonymous function stays "attached" to http.get. i.e. multiple retries means multiple of this func
                    try {
                        var xmlResult = chunk;
                        var jsonResult = JSON.parse(parser.toJson(xmlResult));
                    } catch (err) {
                        retry = true;  // Retry if parsing error
                        // getTeamLiveScore(teamName, funcToCall)
                        return;
                    }

                    console.log(jsonResult)
                    // Need to reformat json due to xml being slightly diff
                    var reformattedJSON = {'w':jsonResult.ss.gms.w, 'gms':jsonResult.ss.gms.g}
                    parseNFLGameData(reformattedJSON, teamName, funcToCall);
                }

            });
        }
    }).on("error", function(e){
        console.log("Got error: " + e.message);
    });
}


/**
 * Used to get historical data for NFL games
 * @returns {{host: string, port: number, path: string}}
 */
function getHistoricalNFLData(week)
{
    var formattedString = '/ajax/scorestrip?season=%s&seasonType=%s&week=%s'
    var season = new Date().getFullYear()  // Get current year
    var seasonType = "REG"
    if( week > 17 )
    {
        seasonType = "POST"
    }

    // http://www.nfl.com/ajax/scorestrip?
    var options = {
        host: 'www.nfl.com',
        port: 80,
        path: util.format(formattedString, season, seasonType, week)
    };

    return options
}


// getTeamHistoricalScore('ravens', 2, function(string){console.log(string)})

// getTeamLiveScore("Steelers", function(string) {console.log(string)})

module.exports = {
    getTeamLiveScore: getTeamLiveScore
}

