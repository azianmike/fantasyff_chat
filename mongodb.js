
storeMessage = function(user, message, userBeingSent)
{
// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
  if(!err) {
    console.log("We are connected");
    var messages = db.collection('messages');
    messages.insert({'userID':user,'message':message});
    db.close()
    }
});
};


updateLastMessageTime = function()
{

}

sayHelloInEnglish = function() {
  return "Hello";
};

getUserToChat = function(user, message, callback){

    // Retrieve
    var MongoClient = require('mongodb').MongoClient;

    // Connect to the db
    MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, db) {
    if(!err) {
        console.log("We are connected");
        var findUser = db.collection('whos_chatting');
        var user = findUser.findOne({'userID':user},function(err,document){
            var userToMessage = document.userToMessage
            console.log('sending message to '+userToMessage);
            var final_message = user+":"+message;
      
            db.close()
        }
        );
        }
    });
}


module.exports.sayHelloInEnglish = sayHelloInEnglish
module.exports.storeMessage = storeMessage
module.exports.getUserToChat = getUserToChat
