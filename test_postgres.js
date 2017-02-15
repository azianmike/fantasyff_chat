var config =  require('./PostgresFunctions/PostgresConfig');

var temp = config.executePostgresQuery('select GetFuzzyNameSearch(\'Tom Bady\');');

temp.then(function(row){
    console.log(row);
    console.log(row[0].getfuzzynamesearch);
    wholeString = row[0].getfuzzynamesearch;
    firstQuote = wholeString.indexOf("\"")+1;
    lastQuote = wholeString.lastIndexOf("\"");
    console.log(row[0].getfuzzynamesearch.substring(firstQuote, lastQuote));
    console.log(typeof parseInt(row[0].getfuzzynamesearch.charAt(lastQuote+2)))
    console.log(typeof 1)
    console.log(0 < parseInt(row[0].getfuzzynamesearch.charAt(lastQuote+2)))
});
