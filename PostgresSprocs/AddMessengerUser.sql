CREATE OR REPLACE FUNCTION AddMessengerUser(messengerSenderIDInput bigint)
RETURNS void
as
$BODY$

DECLARE userIDExists real;

BEGIN
    select userid into userIDExists from messengerUser where messengerUser.messengerSenderID = messengerSenderIDInput;
    IF userIDExists IS NULL
    THEN
        INSERT INTO messengerUser (messengerSenderID) VALUES (messengerSenderIDInput);
    END IF;
END
$BODY$
LANGUAGE plpgsql;