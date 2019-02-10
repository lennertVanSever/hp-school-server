import mysql from 'mysql';

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'kZ5fusLDbq4vb5fk',
  database: 'hp_school',
  multipleStatements: true
});

connection.connect();

export {
  connection
}  