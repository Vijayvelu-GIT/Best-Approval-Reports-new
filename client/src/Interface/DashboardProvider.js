import React, { useState } from "react";
import CtxDashboard from "./Dashboard-Context";


const DashboardProvider = (props) => {

  const [userName, setUserName] = useState(localStorage.getItem("DashBoardUserName"));
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("DashBoardisLoggedIn"));
  const [serverIp, setServerIp] = useState(localStorage.getItem("DashBoardServerIp") || "http://localhost:5070");
  const [selectedCompany, setSelectedCompany] = useState(localStorage.getItem("SelectedCompany"));
  const [exportermasid, setExporterMasId] = useState(localStorage.getItem("ExporterMasId") );
  const [prefix, setPrefix] = useState(localStorage.getItem("Prefix"));
  
  
  const updateUsrNameHandler = (userName) => {
    if (userName.UserName !== null) {
      setUserName(userName.UserName)
      localStorage.setItem("DashBoardUserName", userName.UserName);
    } else {
      setUserName(null)
      localStorage.removeItem("DashBoardUserName");
    }

    if (userName.isLoggedIn === "1") {
      setIsLoggedIn("1");
      localStorage.setItem("DashBoardisLoggedIn", "1");
    } else {
      setIsLoggedIn("0");
      localStorage.removeItem("DashBoardisLoggedIn");
    }

    if (userName.ServerIp !== null) {
      setServerIp(userName.ServerIp);
      localStorage.setItem("DashBoardServerIp", userName.ServerIp);
    }
  };

  
  const updateSelectedCompanyHandler = (companyData) => {
    if(companyData.UserName !== null){
    setSelectedCompany(companyData.selectedCompany);  
    setExporterMasId(companyData.exportermasid);
    setPrefix(companyData.prefix);
    localStorage.setItem("SelectedCompany", companyData.selectedCompany);
    localStorage.setItem("ExporterMasId", companyData.exporterMasId);
    localStorage.setItem("Prefix", companyData.prefix);
    }else{
      console.log("else part working");
      
      setSelectedCompany(null);  
      setExporterMasId(null);
      setPrefix(null);
      localStorage.removeItem("SelectedCompany");
      localStorage.removeItem("ExporterMasId");
      localStorage.removeItem("Prefix");
    }
  };

  
  const TVScreenCtx = {
    userName: userName,
    isLoggedIn: isLoggedIn,
    serverIp: serverIp,
    selectedCompany:selectedCompany,
    exportermasid: exportermasid,
    prefix: prefix,
    updateUsrName: updateUsrNameHandler,
    updateCompany: updateSelectedCompanyHandler,
   };

  return (
    <CtxDashboard.Provider value={TVScreenCtx}>
      {props.children}
    </CtxDashboard.Provider>
  );
};

export default DashboardProvider;