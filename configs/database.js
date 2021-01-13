
/*
const initOptions = {
  
}
const connection = {
  host: '127.0.0.1',
  port: 5432,
  database: 'codemeo',
  user: 'psql_codemeo',
  password: 'chownDown',
};
const pgp = require('pg-promise')(initOptions)

const db = pgp(connection);

module.exports = db
*/


/*
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'chownDown',
  database : 'codemeo'
});

connection.connect(function(err) {
  if (err) throw err;
});

module.exports = connection;
*/

var mysql = require('mysql2');

const connection = mysql.createPool({
  host    : 'localhost',
  user    : 'root',
  password: 'chownDown',
  database: 'codemeo'
});

module.exports = connection;
