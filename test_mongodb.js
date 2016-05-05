var mongoDb = require('./mongodb');
console.log(mongoDb.exports)

console.log(mongoDb.sayHelloInEnglish())
console.log(mongoDb.getUserToChat('test_user', 'random string', function(){}))

