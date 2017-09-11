# __author__ = 'michaell'
#
# import urllib2, json
#
# opener = urllib2.Request("https://api.wit.ai/entities/player/values")
# opener.add_header("Authorization", "Bearer %s" % "ZBA4QPLIQUOHAU5A66NMZKRZMOEZOVVN")
# opener.add_header("Content-Type", "application/json")
# data = {}
# data["value"] = "Deshaun Watson"
# print urllib2.urlopen(opener,json.dumps(data))
# # temp = json.loads(urllib2.urlopen(opener).read())


__author__ = 'michaell'


import os
import nflgame
WIT_API_HOST = os.getenv('WIT_URL', 'https://api.wit.ai')
WIT_API_VERSION = os.getenv('WIT_API_VERSION', '20160516')
import requests

def req(access_token, path, params, **kwargs):
    full_url = WIT_API_HOST + path
    # logger.debug('%s %s %s', meth, full_url, params)
    headers = {
        'authorization': 'Bearer ' + access_token,
        'Content-Type': 'application/json'
    }
    headers.update(kwargs.pop('headers', {}))
    rsp = requests.post(
        full_url,
        None,
        params,
        headers=headers,
        **kwargs
    )
    print rsp

    if rsp.status_code > 200:
        print 'Wit responded with status: ' + str(rsp.status_code) +' (' + rsp.reason + ')'

    json = rsp.json()
    if 'error' in json:
        print 'Wit responded with an error: ' + json
        # raise AssertionError('Wit responded with an error: ' + json)

    # logger.debug('%s %s %s', meth, full_url, json)
    return json

'''
Creates individual player entities in wit.ai
'''
params = {}
# params['id'] = 'player'
setOfPlayers = {}
for i in range(2009, 2017): # Go from 2009 to 2016
# i = 2009
    print 'year ' + str(i)
    games = nflgame.games(i)
    players = nflgame.combine_game_stats(games)
    # for p in players.rushing().sort('rushing_yds').limit(5):
    allYearPlayers = []
    for p in players:
        msg = '%s %d carries for %d yards and %d TDs'
        print str(p.player.full_name)
        playerParam = {}
        playerParam['value'] = str(p.player.full_name)
        # allYearPlayers.append(playerParam)
        # setOfPlayers[str(p.player.full_name)] = True

        # params['value'] = allYearPlayers
        # print str(params)

        req('ZBA4QPLIQUOHAU5A66NMZKRZMOEZOVVN', '/entities/player/values?v=20160516', playerParam)

'''
Creates players entities in witai
'''
# import nflgame
# params = {}
# params['id'] = 'player'
# setOfPlayers = {}
# allYearPlayers = []
#
# for i in range(2009, 2017): # Go from 2009 to 2016
#     print 'year ' + str(i)
#
#     games = nflgame.games(i)
#     players = nflgame.combine_game_stats(games)
#     # for p in players.rushing().sort('rushing_yds').limit(5):
#     if players is not None:
#         for p in players:
#             if p is not None and p.player is not None:
#                 msg = '%s %d carries for %d yards and %d TDs'
#                 if str(p.player.full_name) not in setOfPlayers:
#                     print str(p.player.full_name)
#                     playerParam = {}
#                     playerParam['value'] = str(p.player.full_name)
#                     playerParam['expressions'] = [str(p.player.full_name).lower()]
#                     allYearPlayers.append(playerParam)
#                     setOfPlayers[str(p.player.full_name)] = True
#
# params['values'] = allYearPlayers
# print str(params)
# print len(allYearPlayers)
#
# req('ZBA4QPLIQUOHAU5A66NMZKRZMOEZOVVN', '/entities?v=20160516', params)


'''
Creates football team entities in witai
'''
# params = {}
# params['id'] = 'football_team'
# allTeams = []
# for team in nflgame.teams:
#     teamParam = {}
#     teamParam['value'] = team[0]
#     teamParam['expressions'] = team
#     allTeams.append(teamParam)
#
# params['values'] = allTeams
#
# req('ZBA4QPLIQUOHAU5A66NMZKRZMOEZOVVN', '/entities?v=20160516', params)