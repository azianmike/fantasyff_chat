/**
 * Created by michaell on 12/11/16.
 */

var http = require('http');

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

function parseNFLGameData(jsonResult, teamName, funcToCall) {
// The JSON result for games
    var games = jsonResult.gms
    for (var game in games) {  // Loop through games to match team names
        var gameObj = games[game]
        if (gameObj.vnn.toLowerCase() === teamName.toLowerCase() || gameObj.hnn.toLowerCase() === teamName.toLowerCase()) {
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
    }
}
/**
 * Gets a team's live score given a name
 * @param teamName name of team to get score of
 * @param callback function after getting the team score
 */
function getTeamLiveScore( teamName, funcToCall )
{
    http.get(getLiveNFLData(), function(resp){
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
 * Used to get historical data for NFL games
 * @returns {{host: string, port: number, path: string}}
 */
function getHistoricalNFLData()
{
    // http://www.nfl.com/ajax/scorestrip?
    var options = {
        host: 'www.nfl.com',
        port: 80,
        path: 'ajax/scorestrip?'
    };

    return options
}
// getTeamLiveScore("Steelers", function(string) {console.log(string)})

module.exports = {
    getTeamLiveScore: getTeamLiveScore
}