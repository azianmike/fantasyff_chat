CREATE OR REPLACE FUNCTION GetNotificationsToSend()
RETURNS TABLE(notificationID int, messengerSenderIDsToSend bigint, player_id varchar(40), touchdowns int, yards int, passing_yards int)
AS
$BODY$
BEGIN
    CREATE TEMP TABLE notifToSendOut AS
    SELECT * FROM notificationToSend ORDER BY notificationID ASC LIMIT 100;

    DELETE FROM notificationToSend WHERE notificationToSend.notificationID IN (SELECT notifToSendOut.notificationID FROM notifToSendOut);

    RETURN QUERY SELECT * FROM notifToSendOut;
END;
$BODY$
LANGUAGE plpgsql
COST 2;