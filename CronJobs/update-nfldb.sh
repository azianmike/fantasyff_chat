/**  “At every 5th minute past every hour from 5 through 20 on Sunday.” **/
*/5 09-22 * * 0 /home/ubuntu/nfl/bin/nfldb-update

/** “At every 5th minute past every hour from 17 through 22 on Monday." **/
*/5 17-22 * * 1 /home/ubuntu/nfl/bin/nfldb-update

/** “At every 5th minute past every hour from 17 through 22 on Thursday.” **/
*/5 17-22 * * 4 /home/ubuntu/nfl/bin/nfldb-update

/**  “At minute 0 past every hour from 9 through 18 on every day-of-week from Tuesday through Wednesday and every day-of-week from Friday through Saturday.” **/
00 09-18 * * 2-3,5-6 /home/ubuntu/nfl/bin/nfldb-update