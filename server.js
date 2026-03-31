const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const loginDetails = require("./LoginDetails");
const FabricApproval = require("./FabricOrdApproval");
const YarnPoApproval = require("./YarnPoApproval");
const GeneralBudApproval = require("./GeneralBudApproval");

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
  FabricApproval.insertFabricApproval(req.body, res)
});

app.post("/api/rejectFabricApproval", (req, res) => {  
  FabricApproval.rejectFabricApproval(req.body, res)
});


// -------------------------------------------------------------------------------


// yarn po approval

app.post("/api/getYarnPoApproval", (req, res) => { 
  YarnPoApproval.getYarnPoApprovalSelect(req.body, res)
});

app.post("/api/insertYarnPoApproval", (req, res) => {  
  YarnPoApproval.insertYarnPoApproval(req.body, res)
});

// app.post("/api/insertYarnPoReject", (req, res) => {
//   YarnPoApproval.insertYarnPoReject(req.body, res)
// });



// -------------------------------------------------------------------------------


// General Po approval

app.post("/api/getGeneralPoApproval", (req, res) => { 
  GeneralBudApproval.getGeneralPoApproval(req.body, res)
});

app.post("/api/insertGeneralPoApproval", (req, res) => { 
  GeneralBudApproval.approvalGeneralPoApp(req.body, res)
});

app.post("/api/insertGeneralPoReject", (req, res) => { 
  GeneralBudApproval.rejectGeneralPoApp(req.body, res)
});


// -------------------------------------------------------------------------------

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
})


