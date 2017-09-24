CREATE OR REPLACE FUNCTION AddPlayerSubscription(messengerSenderIDInput bigint, name VARCHAR(70))
RETURNS void
as
$BODY$

DECLARE
userIDExists int;
playerID varchar(40);

BEGIN
    select userid into userIDExists from messengerUser where messengerUser.messengerSenderID = messengerSenderIDInput;
    IF userIDExists IS NULL
    THEN
        INSERT INTO messengerUser (messengerSenderID) VALUES (messengerSenderIDInput);
    END IF;

    SELECT userid into userIDExists from messengerUser where messengerUser.messengerSenderID = messengerSenderIDInput;
    SELECT player_id into playerID from player where full_name = name;

    if (SELECT SubscriptionID FROM playerSubscription WHERE player_id = playerID AND userID = userIDExists) IS NULL
    THEN
        INSERT INTO playerSubscription (userID, player_id) VALUES (userIDExists, playerID);
    END IF;
END;
$BODY$
LANGUAGE plpgsql;