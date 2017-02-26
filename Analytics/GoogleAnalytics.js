/**
 * Created by michaell on 2/26/17.
 */
var ua = require('universal-analytics');

const GA_TRACKING_ID = "UA-92678840-1";

var visitor = ua(GA_TRACKING_ID);

function trackGetStats(statToGet) {
    visitor.event("Intent", "GetStats", statToGet, 1, function (err) {
            if(err) {
                console.log(err);
            }
        }
    ).send()
}

function trackPlayer(playerName) {
    visitor.event("Entities", "player", playerName, 1, function (err) {
        if(err) {
            console.log(err);
        }
    }
    ).send()
}

function trackGetTeamScore(team1, team2) {
    visitor.event("Intent", "GetScore", team1, 1, function (err) {
        if(err) {
            console.log(err);
        }
        }
    ).send()

    if(team2){
        visitor.event("Intent", "GetScore", team2, 1, function (err) {
            if(err) {
                console.log(err);
            }
        }
        ).send()
    }
}


module.exports = {
    trackGetStats: trackGetStats,
    trackPlayer: trackPlayer,
    trackGetTeamScore: trackGetTeamScore
}

