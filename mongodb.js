var fb_apicalls = require('./fb_apicalls');
var MongoClient = require('mongodb').MongoClient;

storeMessage = function (user, message, userBeingSent) {
// Retrieve
    var MongoClient = require('mongodb').MongoClient;

// Connect to the db
    MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, db) {
        if (!err) {
            console.log("We are connected");
            var messages = db.collection('messages');
            messages.insert({'userID': user, 'message': message});
            db.close()
        }
    });
};

/**
 * Checks to see if we have the userID's full name (gotten from fb api calls)
 * @param userID userID to check if we have the full name of
 */
function getUsersNameAndSendMessage(userID, message, userIDToSendMessage, db) {

    console.log('getting users name and sending message')
    var findUserName = db.collection("user_names");
    findUserName.findOne({'userID': userID}, function (err, document) {
        if (err || !document) // Error finding user, means we need to get the person's name
        {
            var sendMessageFunction = function(userIDToSendMessage, finalMessage)
            {
                fb_apicalls.sendTextMessage(userIDToSendMessage, finalMessage )
            }
            fb_apicalls.getUserName(userID, message, db, sendMessageFunction);
            console.log('Error finding user in getUserToChat');
            return;
        }
        var indxOfSpace = document.usersName.indexOf( ' ' );
        var substringName = document.usersName.substring(0, indxOfSpace + 2);
        substringName = substringName
        var finalMessage = substringName + ' : ' + message;
        console.log('sending final message')
        fb_apicalls.sendTextMessage(userIDToSendMessage, finalMessage )
        db.close()
    });
}

/**
 * Gets the users name (always assumed to be in DB as the name should be gotten on FIRST message)
 *
 * @param userID userID to get name for
 * @param db db connection
 * @param callback callback function to call
 */
function getUsersName(userID, db, callback) {
    console.log("inserting into queue FUNCTIOn " + userID)
    var findUserName = db.collection("user_names");
    findUserName.findOne({'userID': userID}, function (err, document) {
        if (!err && document && callback != null) {
            console.log('found users name')
            callback(userID, document.usersName);
        }
        else
        {
            console.log('didnt find users name')
        }
        db.close();
    });
}

/**
 * Either gets a new user to chat from queue if exists or places the current user in queue
 * @param userID userID to send message too
 * @param message message to send
 * @param db mongodb cursor
 */
function getNewUserToChat(userID, message, db){
    var chatQueue = db.collection("chat_queue")

    chatQueue.findOne({}, function (err, document) {
        if (err || !document) // Error finding a new user to chat with, need to insert
        {
            console.log('Error finding a new user to chat with, inserting into queue now ' + userID);
            var insertUserIntoChatQueueFunction = function(userID, usersName)
            {
                console.log('inside insert user into queue callback');
                chatQueue.insert({"userID":userID, "usersName":usersName});
            };
            getUsersName(userID, db,insertUserIntoChatQueueFunction );
            fb_apicalls.sendTextMessage(userID, "We are currently looking for a new user to chat with you...")
            return;
        }

        var otherUsersName = document.usersName;  // Name of person to chat
        var findUserName = db.collection("user_names");
        chatQueue.remove({});

        findUserName.findOne({'userID': userID}, function (err, document) {
            if (!err && document) {
                console.log("new chat match");
                // Name of current user of userID
                fb_apicalls.sendTextMessage(userID, "You are now chatting with " + document.usersName);
                fb_apicalls.sendTextMessage(document.userID, "You are now chatting with " + otherUsersName)

                var setUsersChatting = db.collection('whos_chatting');
                setUsersChatting.insert({"userID":userID, "userName":document.usersName,
                    "userToMessageID":document.userID, "userToMessageName":otherUsersName});
                setUsersChatting.insert({"userID":document.userID, "userName":otherUsersName,
                    "userToMessageID":userID, "userToMessageName":document.usersName});
                db.close()
            }}
            );

    })
}

/**
 * Returns either the current person chatting or a new person if a new person to chat is needed
 * @param user user who wants to chat with someone
 * @param message
 * @param db a db cursor connection (that must be connected)
 */
function getUserToChat (userID, message, db) {
    var findUser = db.collection('whos_chatting');

    var user = findUser.findOne({'userID': userID}, function (err, document) {
        if (err || !document) // Error finding user, means we need to look for a new user or add in queue to get chatted with
        {
            getNewUserToChat(userID, message, db);
            console.log('Error finding user in getUserToChat');
            return;
        }
        console.log('got user to chat')
        var userIDToMessage = document.userToMessageID;
        getUsersNameAndSendMessage(userID, message, userIDToMessage, db)
    });

}

/**
 * Starting point of sending a message to a partner
 *
 * @param userID user who SENT the message, not necessarily one who is going to get messaged
 * @param message 
 */
function sendMessageToPartner( userID, message )
{
    MongoClient.connect("mongodb://localhost:27017/chatttMe", {server: {
        socketOptions: {
            connectTimeoutMS: 500,
            socketTimeoutMS: 500
        }
    }
    }, function (err, db) {
        if( !err )
        {
            getUserToChat(userID, message, db);
        }
    });
}

module.exports.storeMessage = storeMessage
module.exports.getUserToChat = getUserToChat
module.exports.getUsersName = getUsersNameAndSendMessage
module.exports.sendMessageToPartner = sendMessageToPartner

