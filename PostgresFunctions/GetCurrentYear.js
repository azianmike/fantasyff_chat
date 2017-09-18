/**
 * Created by michaell on 2/14/17.
 */

/**
 * Current season is 2017
 * @returns {number}
 */
function getCurrentYear(){
    return new Date().getFullYear();
}


module.exports = {
    getCurrentYear: getCurrentYear
}