/**
 * Created by michaell on 2/14/17.
 */

/**
 * Current season is 2016
 * @returns {number}
 */
function getCurrentYear(){
    return new Date().getFullYear() - 1;
}


module.exports = {
    getCurrentYear: getCurrentYear
}