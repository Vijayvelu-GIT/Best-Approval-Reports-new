import React, { useState } from "react";

const CtxDashboard = React.createContext({
    userName: "",
    isLoggedIn: "",
    serverIp: "",
    selectedCompany : "",
    exportermasid: "",
    prefix : "",
   
    updateUsrName: () => { },
    updateCompany: () => { },
    
});
export default CtxDashboard;


