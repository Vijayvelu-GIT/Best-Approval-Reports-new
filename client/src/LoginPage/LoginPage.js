import React, { useState, useRef, useEffect, useContext } from "react";
import { TextBoxComponent } from "@syncfusion/ej2-react-inputs";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { ToastComponent } from "@syncfusion/ej2-react-notifications";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";
import logo from "../Images/best-2.png";
import { checkUserDetails } from "../serverCommication/ServerPostApi"
import { getSelectedCompany } from "../serverCommication/ServerPostApi"
import { Query } from "@syncfusion/ej2-data";
import CtxDashboard from "../Interface/Dashboard-Context";
import md5 from "md5";

export default function Login() {
  const dashboardCtx = useContext(CtxDashboard);
  const location = useLocation();

  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    location.state?.companySelect === true
  );
  // const [selectedValue, setSelectedValue] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [exporterMasId, setExporterMasId] = useState(null);
  const [companyList, setCompanyList] = useState([]);

  // Add refs for input fields
  const userNameRef = useRef(null);
  const pwdRef = useRef(null);
  const serverNameRef = useRef(null);

  const toastRef = useRef(null);
  const navigate = useNavigate();
  const serverIp = dashboardCtx.serverIp;
  console.log(serverIp);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSelectedCompany(serverIp);
        setCompanyList(result.data);
        // console.log("Result:", result);
      } catch (error) {
        console.error("Error fetching fabric approval:", error);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    if (location.state?.companySelect) {
      setIsLoggedIn(true);
    }
  }, [location.state]);

  // Handle initial login button click
  const handleLoginClick = () => {

    console.log(serverNameRef.current?.value?.trim(), "test");

    // Get values from refs
    const l_EnteredUsrName_str = userNameRef.current?.value?.trim() || "";
    const l_EnteredPwd_str = pwdRef.current?.value?.trim() || "";
    const l_EnterServerName = serverNameRef.current?.value?.trim() || serverIp; // Use default if not provided

    // Validate inputs
    if (!l_EnteredUsrName_str || !l_EnteredPwd_str) {
      toastRef.current?.show({
        content: "Please enter username and password",
        cssClass: "e-toast-danger"
      });
      return;
    }

    // Show loading toast
    toastRef.current?.show({
      content: "Logging in...",
      cssClass: "e-toast-info"
    });

    // Call checkUserDetails
    const userDet = {
      username: l_EnteredUsrName_str,
      password: md5(l_EnteredPwd_str)
    };

    // console.log(userDet, "userDet");    


    checkUserDetails(l_EnterServerName, userDet)
      .then(result => {
        // console.log("Login result:", result);
        if (result.STATUS) {
          toastRef.current?.show({
            content: "Login successful!",
            cssClass: "e-toast-success"
          });

          // Update context with user details
          dashboardCtx.updateUsrName({
            UserName: l_EnteredUsrName_str,
            isLoggedIn: "1",
            ServerIp: l_EnterServerName
          });

          // Move to company selection
          setIsLoggedIn(true);
        } else {
          alert("Invalid username or password")


          // Update context for failed login
          dashboardCtx.updateUsrName({
            UserName: null,
            isLoggedIn: "0",
            ServerIp: l_EnterServerName
          });
        }
      })
      .catch(error => {
        console.error("Login error:", error);
        toastRef.current?.show({
          content: error.message || "Login failed. Please try again.",
          cssClass: "e-toast-danger"
        });
      });
  };

  // Handle company selection submit
  const handleSubmit = () => {
    if (!selectedCompany) {
      toastRef.current?.show({
        content: "Please select a company",
        cssClass: "e-toast-danger"
      });
      return;
    }

    // Update context with selected company
    dashboardCtx.updateCompany({ selectedCompany });

    // Navigate to home/dashboard
    navigate("/home");
  };

  const handleBack = () => {
    setIsLoggedIn(false);
    // Clear selections
    setSelectedCompany(null);
    setExporterMasId(null);
  };

  const onCompanyFiltering = (e) => {
    const query = new Query();
    query.where("COMPANYID", "contains", e.text, true);
    e.updateData(companyList, query);
  };

  return (
    <div className="login-container">
      <ToastComponent
        ref={toastRef}
        position={{ X: "Center", Y: "Top" }}
        timeOut={3000}
      />

      <div className="login-wrapper">
        {/* Left Side Logo */}
        <div className="login-left">
          <img src={logo} alt="BEST Logo" className="login-logo" />
        </div>

        {/* Right Side Card */}
        <div className="login-right">
          {!isLoggedIn ? (
            <>
              <h2>User Login</h2>
              <div className="login-form">
                <TextBoxComponent
                  ref={userNameRef}
                  placeholder="Username"
                  floatLabelType="Auto"
                  cssClass="e-outline"
                />

                <TextBoxComponent
                  ref={pwdRef}
                  type="password"
                  placeholder="Password"
                  floatLabelType="Auto"
                  cssClass="e-outline"
                />

                {/* <TextBoxComponent
                  ref={serverNameRef}
                  placeholder="Server IP (optional)"
                  floatLabelType="Auto"
                  value={serverIp}
                  cssClass="e-outline"
                
                /> */}

                <ButtonComponent
                  content="Login"
                  cssClass="login-btn"
                  onClick={handleLoginClick}
                />
              </div>
            </>
          ) : (
            <>
              <h2>Select Company</h2>
              <div className="login-form">
                <DropDownListComponent
                  id="company"
                  dataSource={companyList}
                  fields={{ text: "COMPANYID", value: "COMPANYID" }}
                  placeholder="Company name"
                  floatLabelType="Auto"
                  allowFiltering={true}
                  filtering={onCompanyFiltering}
                  cssClass="advanced-dropdown"
                  change={(e) => {
                    const selected = companyList.find(
                      (comp) => comp.COMPANYID === e.value
                    );
                    if (selected) {
                      setSelectedCompany(selected.COMPANYID);
                    }
                  }}
                />

                <div className="dropdown-buttons">
                  <ButtonComponent
                    content="Submit"
                    cssClass="small-btn submit-btn"
                    onClick={handleSubmit}
                  />
                  <ButtonComponent
                    content="Back"
                    cssClass="small-btn back-btn"
                    onClick={handleBack}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}