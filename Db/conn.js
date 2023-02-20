const mysql = require("mysql2");

let mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "waseem",
  database: "bank",
  multipleStatements: true,
});
mysqlConnection.connect((err) => {
  if (!err) console.log("Connection Established Successfully");
  else console.log("Connection Failed!" + JSON.stringify(err, undefined, 2));
});

// const mongoose = require("mongoose");
// const db = "mongodb+srv://waseem8449:waseem@cluster0.1rdpngo.mongodb.net/Banking";
// mongoose
//   .connect(db, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("connection start"))
//   .catch((error) => console.log(error.message));
