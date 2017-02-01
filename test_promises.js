/**
 * Created by michaell on 1/29/17.
 */
Promise = require('bluebird')
var config =  require('./PostgresFunctions/PostgresConfig');

var A = function() {

    return new Promise(function(resolve, reject) {
        var result = 'A is done'

        console.log(result);
        resolve(result);
    })
}

var B = function() {

    return new Promise(function(resolve, reject) {
        var result = 'B is done'

        setTimeout(function() {
            console.log(result);
            resolve(result);
        }, 2000)
    })
}

var C = function() {

    return new Promise(function(resolve, reject) {
        var result = 'C is done'
        console.log(result)
        resolve(result);
    })
}

var D = function() {

    return new Promise(function(resolve, reject) {
        var result = 'D is done'
        console.log(result)
        resolve(result);
    })
}

A()
    .then(function(result) {
        return B();
    })
    .then(C)
    .then(D).then(
    function() {
        temp = config.executePostgresQuery('select GetFuzzyNameSearch(\'Tom Bardy\');') .then(function(row)
        {
            console.log(row);
            return row;
        });
        console.log(temp);
    }
);



// var str = "How are you doing today?";
// var res = str.split(" ");
// for(var indx = 0; indx < res.length; indx++)
// {
//     console.log(res[indx])
// }
// console.log(res)
// var c = "A";
// console.log(c.toUpperCase() != c.toLowerCase())
//
// var full_string = "yes!"
// full_string = full_string.substring(0, full_string.length-1)
// console.log(full_string)