CREATE OR REPLACE FUNCTION AddMessengerUser(messengerSenderID varchar(40))
RETURNS void
as
$BODY$

INSERT INTO messengerUser (messengerSenderID) VALUES (messengerSenderID);

$BODY$
LANGUAGE sql;