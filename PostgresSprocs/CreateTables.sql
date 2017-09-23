CREATE TABLE messengerUser (
    userID      serial PRIMARY KEY,
    messengerSenderID       bigint NOT NULL
);


CREATE TABLE playerSubscription (
    SubscriptionID      serial PRIMARY KEY,
    userID       int NOT NULL,
    player_id    varchar(40) NOT NULL
);