/**
 * Created by michaell on 1/28/17.
 */

var config =  require('./PostgresConfig');
var Promise = require("bluebird");

/**
 * Use promises to get the closest name search if we dont have a name.
 * Note that promises run asynchrounously and will update the shortest variable
 * but we only care about the absolute shortest (with tie breaker being whichever gets set last)
 * @param full_string
 */
function fuzzyNameSearch(full_string)
{
    if(!checkIfLetter(full_string.charAt(full_string.length-1)))  // Last char isn't a letter
    {
        full_string = full_string.substring(0, full_string.length-1)
    }
    var words = full_string.split(" ");

    for(var indx = 0; indx < words.length-1; indx++)  // Go until second to last word
    {
        full_name = words[indx] + " " + words[indx+1];
        var postgresPromise = config.executePostgresQuery('select GetFuzzyNameSearch(\''+ full_name +'\');');
        // postgresPromise().
    }

}

function checkIfLetter(c)
{
    return c.toUpperCase() != c.toLowerCase()
}
