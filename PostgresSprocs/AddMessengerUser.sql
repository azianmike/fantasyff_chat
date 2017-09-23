CREATE OR REPLACE FUNCTION AddMessengerUser(messengerSenderID bigint)
RETURNS void
as
$BODY$

INSERT INTO messengerUser (messengerSenderID) VALUES (messengerSenderID);

$BODY$
LANGUAGE sql;