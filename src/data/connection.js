import dotenv from 'dotenv';
import mysql from 'mysql';
dotenv.config();
console.log(process.env);
var connection = mysql.createConnection({
  host: 'hp-education.c7tfzswraxss.eu-central-1.rds.amazonaws.com',
  user: 'sara',
  password: process.env.DB_PASSWORD,
  database: 'hp-education',
  multipleStatements: true
});

connection.connect();

export {
  connection
}  