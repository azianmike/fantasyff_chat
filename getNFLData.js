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

/**
 * Gets a team's live score given a name
 * @param teamName name of team to get score of
 */
function getTeamLiveScore( teamName )
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
                        getTeamLiveScore(teamName)
                        return;
                    }
                    
                    var games = jsonResult.gms
                    for (var game in games) {
                        var gameObj = games[game]
                        if (gameObj.vnn.toLowerCase() === teamName.toLowerCase() || gameObj.hnn.toLowerCase() === teamName.toLowerCase()) {
                            console.log("Score is " + gameObj.vs + " to " + gameObj.hs)
                            return;
                        }
                    }
                    console.log("Not found")
                    console.log(jsonResult)
                }

            });
        }
    }).on("error", function(e){
        console.log("Got error: " + e.message);
    });
}

getTeamLiveScore("Steelers")

