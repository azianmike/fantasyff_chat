CREATE TABLE messengerUser (
    userID      serial PRIMARY KEY,
    messengerSenderID       bigint UNIQUE NOT NULL
);


CREATE TABLE playerSubscription (
    SubscriptionID      serial PRIMARY KEY,
    userID       int NOT NULL,
    player_id    varchar(40) NOT NULL,
    lastProcessedPlayID bigint,
    lastProcessedGsisID text
);

CREATE TABLE notificationToSend (
    notificationID      serial PRIMARY KEY,
    messengerSenderIDsToSend       bigint NOT NULL,
    player_id    varchar(40) NOT NULL,
    touchdowns    int NOT NULL,
    yards int NOT NULL,
    passing_yards int NOT NULL
);