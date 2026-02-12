const mysql = require("mysql2");

const mydb = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hotel_node_js",
  dateStrings: true,
});

mydb.connect((err) => {
  if (err) {
    console.log(`Cannot connect to database because: ${err}`);
  } else {
    console.log("Connected to the database successfully.");
  }
});

module.exports = mydb;
