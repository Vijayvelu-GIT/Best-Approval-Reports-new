const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const loginDetails = require("./LoginDetails")
const FabricApproval = require("./FabricOrdApproval")
const YarnPoApproval = require("./YarnPoApproval")

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const port = 5070;

app.post("/api/loginDetails", (req, res) => {
  // console.log("req.params => ", req.body)
  loginDetails.login(req.body, res)
})

app.post("/api/getSelectedCompany", (req, res) => {
  // console.log("req.params => ", req.body)
  FabricApproval.getSelectedCompany(req.body, res)
})

app.post("/api/getFabricApproval", (req, res) => {
  // console.log("req.params => ", req.body)
  FabricApproval.getFabricApproval(req.body, res)
});

app.post("/api/insertFabricApproval", (req, res) => {
  //  console.log("req.params => ", req.body)
  FabricApproval.insertFabricApproval(req.body, res)
});

app.post("/api/rejectFabricApproval", (req, res) => {
  // console.log("req.params => ", req.body)
  FabricApproval.rejectFabricApproval(req.body, res)
});


// yarn po approval

app.post("/api/getYarnPoApproval", (req, res) => {
  // console.log("req.params => ", req.body)
  YarnPoApproval.getYarnPoApproval(req.body, res)
});



app.listen(port, () => {
  console.log(`Server is running at ${port}`);
})


