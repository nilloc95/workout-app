let mysql = require("mysql")

let pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs290_gilmorco',
    password        : '6985',
    database        : 'cs290_gilmorco'
  });

module.exports.pool = pool