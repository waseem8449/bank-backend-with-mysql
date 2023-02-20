const express = require("express");
const app = express();
require("./Db/conn");
const cors = require("cors");
const router = require("./routes/router");
require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use(router);
const port = 8000;
app.listen(port, (req, res) => {
  console.log(`server is start on port ${port}`);
});
