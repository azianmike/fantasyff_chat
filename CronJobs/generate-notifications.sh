/**  “At every 5th minute past every hour from 5 through 20 on Sunday.” **/
*/2 09-22 * * 0 /usr/bin/psql -U nfldb -c "select GenerateNotifications()"

/** “At every 5th minute past every hour from 17 through 22 on Monday." **/
*/2 17-22 * * 1 /usr/bin/psql -U nfldb -c "select GenerateNotifications()"

/** “At every 5th minute past every hour from 17 through 22 on Thursday.” **/
*/2 17-22 * * 4 /usr/bin/psql -U nfldb -c "select GenerateNotifications()"

/**  “At minute 0 past every hour from 9 through 18 on every day-of-week from Tuesday through Wednesday and every day-of-week from Friday through Saturday.” **/
00 09-18 * * 2-3,5-6 /usr/bin/psql -U nfldb -c "select GenerateNotifications()"