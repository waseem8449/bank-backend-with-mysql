const jwt = require("jsonwebtoken");
const mysql = require("mysql2");

let conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "waseem",
  database: "bank",
  multipleStatements: true,
});
async function authMethod(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) {
    const err = new Error("Auth token missing.");
    err.status = 401;
    return next(err);
  }

  token = token.split(" ")[1];
  const decoded = jwt.decode(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }

  try {
    let squery = `SELECT * FROM user WHERE email='${decoded.email}'`;
    conn.query(squery, (err, user) => {
      if (err) throw err;
      if (user.length > 0) {
        req.user = user;
        next();
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid Token",
        });
      }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { authMethod };
