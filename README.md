To run the main.js (hodor is included) use `sudo nohup node main.js` & or 
`sude node main.js` to not run in a seperate process. Runs on port 80



Things left to do:

Use python nflgame to create a service to populate mongodb with player stats (historical and current)

Get fuzzy player name search - Done
Get individual player stats and for years - in progress
    - Get generic player stats
        - Write sproc to get generic stats for timeframe ✓
        - Finished fuzzy name search with wit.ai integration ✓
        - Take in different stats to get ✓
Get score of nfl teams
    - Get historical scores
        - Take in at least one team and 1) a week and a year or 2) a year and a team (opponent)  ✓
        - Implement postseason week feature ✓
    - Get live scores
        - Get score of past games if this week hasn't been played yet.
        - Get score of current game while being played
        - Format string such that it says how much time is left/final score/etc
Error cases i.e. "give me the score of the potato game"
Conditional based on day of week for "game for week %s has not been played"  ✓
Player stats

 {
         "hs": 24,
         "d": "Thu",
         "gsis": 57109,
         "vs": 3,
         "eid": 2016121500,
         "h": "SEA",
         "ga": "",
         "rz": -1,
         "v": "LA",
         "vnn": "Rams",
         "t": "8:25",
         "q": "F",
         "hnn": "Seahawks"
      },

hs = home score
d = day
vs = away score
h = home team abbreviation
ga = ???
rz = red zone, true or false?
t = time game starts
q = status. F/FO = final/final overtime. P = yet to be played

Get chatbot restarted again : sudo nohup node main.js ZBA4QPLIQUOHAU5A66NMZKRZMOEZOVVN &