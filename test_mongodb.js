var mongoDb = require('./mongodb');
console.log(mongoDb.exports)

// Retrieve
var MongoClient = require('mongodb').MongoClient;

// // Connect to the db
// MongoClient.connect("mongodb://localhost:27017/chatttMe", function (err, db) {
//         if (!err) {
//             console.log(mongoDb.sayHelloInEnglish())
//             console.log(mongoDb.getUserToChat('test_user', 'random string', db))
//         }
//     }
// );
//
// // Connect to the db
// MongoClient.connect("mongodb://localhost:27017/chatttMe", function (err, db) {
//         if (!err) {
//             console.log(mongoDb.getUserToChat('test_user_does_not_exist', 'random string', db))
//         }
//     }
// );

// Main path through messages
console.log(mongoDb.sendMessageToPartner("1066788706701426", 'omg this werks'));


// console.log(mongoDb.getUsersName('1066788706701426'));


