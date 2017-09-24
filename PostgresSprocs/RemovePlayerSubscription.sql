CREATE OR REPLACE FUNCTION RemovePlayerSubscription(messengerSenderIDInput bigint, name VARCHAR(70))
RETURNS void
as
$BODY$

DECLARE
userIDExists int;
playerID varchar(40);

BEGIN
    SELECT userid into userIDExists from messengerUser where messengerUser.messengerSenderID = messengerSenderIDInput;
    SELECT player_id into playerID from player where full_name = name;

    if (SELECT SubscriptionID FROM playerSubscription WHERE player_id = playerID AND userID = userIDExists) IS NOT NULL
    THEN
        DELETE FROM playerSubscription WHERE userID = userIDExists and player_id = playerID;
    END IF;
END;
$BODY$
LANGUAGE plpgsql;