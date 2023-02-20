const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const { authMethod } = require("../common-middleware");
let conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "waseem",
  database: "bank",
  multipleStatements: true,
});
router.post("/register", async (req, res) => {
  const { name, email, phone_number, userType, password } = req.body;
  if (!name || !email || !password || !userType) {
    res.status(404).json("plwease fill data");
  }

  try {
    let squery = `SELECT * FROM user WHERE email='${email}'`;
    conn.query(squery, (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        return res.status(400).json("user already present try with another gmail id");
      } else {
        let accountNo = Math.floor(10000000 + Math.random() * 90000000);
        let amount = 100000;
        let data = {
          name: name,
          email: email,
          phone_number: phone_number,
          userType: userType,
          password: password,
          accountNo: accountNo,
          amount: amount,
        };

        let sqlQuery = "INSERT INTO user SET ?";

        let query = conn.query(sqlQuery, data, (err, results) => {
          if (err) throw err;
          res.send(results);
        });
      }
    });
  } catch (error) {
    res.status(404).json(error);
  }
});

router.post("/Login", (req, res) => {
  const { email, password } = req.body;
  try {
    let squery = `SELECT * FROM user WHERE email='${email}' and password='${password}'`;
    conn.query(squery, (err, user) => {
      if (err) throw err;
      if (user.length > 0) {
        const token = jwt.sign({ email: user[0].email }, "waseem", {
          expiresIn: "1d",
        });
        res.status(200).json({
          token: token,
          user: user,
        });
      }
    });
  } catch (error) {
    return error;
  }
});

router.get("/getCandidateList", authMethod, async (req, res) => {
  try {
    const { userType } = req.user[0];
    if (userType == "Banker") {
      let squery = `select * FROM user where userType="Candidate"`;
      conn.query(squery, (err, user) => {
        if (err) throw err;
        if (user.length > 0) {
          res.status(200).json({
            user,
          });
        }
      });
    }
  } catch (error) {
    res.status(404).json(error);
  }
});

router.post("/transaction", authMethod, async (req, res) => {
  let { Account, Amount,receiverName } = req.body;
  let { name, accountNo, amount } = req.user[0];
  try {conn.beginTransaction(function(err) {

    let squery = `SELECT * FROM user WHERE accountNo='${Account}'`;
    conn.query(squery, (err, acc) => {
       if (err) { 
      conn.rollback(function() {
        throw err;
      });
    }
      if (acc.length < 0) {
       return res.status(200).json({
          user: "receiver detail is not correct",
        });
      }
      if (Amount <= amount) {
        let amo = amount - Amount;
        let receive = acc[0].amount + Amount;
        let sqlQuery =
          "UPDATE user SET amount='" + amo + "' WHERE accountNo=" + accountNo;

        conn.query(sqlQuery, (err, results) => {
           if (err) { 
      conn.rollback(function() {
        throw err;
      });
    }

        });
        let sQuery =
          "UPDATE user SET amount='" + receive + "' WHERE accountNo=" + Account;

        conn.query(sQuery, (err, results) => {
           if (err) { 
      conn.rollback(function() {
        throw err;
      });
    }
        });
        const data = {
          senderName: name,
          receiverName:receiverName,
          remainingBalance: amo,
          senderAccountNo: accountNo,
          receiverAccountNo: Account,
          amount: Amount,
          transactionDate:new Date()
        };
        let Query = "INSERT INTO transactions SET ?";
        let query = conn.query(Query, data, (err, results) => {
          if (err) throw err;
          
          res.status(404).json("user amount has been transfer sucessfully");
        });
      } else {
        res.status(404).json("balance is low");
      }
    });
  })
  } catch (err) {
    res.status(201).json(err);
    console.log(err);
  }
});

router.get("/showTransactions", authMethod, async (req, res) => {
  try {
    let squery = `select * FROM transactions`;
      conn.query(squery, (err, user) => {
        if (err) throw err;
        if (user.length > 0) {
          res.status(200).json({
            user,
          });
        }
      });
  } catch (error) {
    res.status(404).json(error);
  }
});

router.get("/showUser",authMethod, async (req, res) => {
  let { accountNo } = req.user[0];
  try {
    let squery = `select * FROM user where accountNo='${accountNo}'`;
    conn.query(squery, (err, user) => {
      if (err) throw err;
      if (user.length > 0) {
        res.status(200).json({
          user,
        });
      }
    });
  } catch (error) {
    res.status(404).json(error);
  }
});
router.get("/history", authMethod, async (req, res) => {
  let { accountNo } = req.user[0];
  
  try {
    let squery = `select * FROM transactions where senderAccountNo='${accountNo}' OR receiverAccountNo='${accountNo}'`;
    conn.query(squery, (err, user) => {
      if (err) throw err;
      if (user.length > 0) {
        res.status(200).json({
          user,
        });
      }
    });

  } catch (error) {
    res.status(404).json(error);
  }
});

module.exports = router;
