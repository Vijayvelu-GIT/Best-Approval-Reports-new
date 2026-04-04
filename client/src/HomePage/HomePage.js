import React, { useContext, useEffect, useState } from "react";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { AppBarComponent } from "@syncfusion/ej2-react-navigations";
import "./HomePage.css";
// import logo2 from "../Images/logo2.png";
import logo2 from "../Images/logo2.png";
import { useNavigate } from "react-router-dom";
import CtxDashboard from "../Interface/Dashboard-Context";
import { getFabricApproval, getYarnPoApproval, getGeneralPoApproval } from "../serverCommication/ServerPostApi"
// import { User } from "lucide-react";
import { User, Building2, LogOut } from "lucide-react";


export default function Home() {
    const navigate = useNavigate();
    const dashboardCtx = useContext(CtxDashboard);
    const serverIp = dashboardCtx.serverIp;


    // console.log("dashboardCtx.isLoggedIn", +dashboardCtx.isLoggedIn);

    const [fabCount, setFabCount] = useState(0);
    const [yarnPoCount, setYarnPoCount] = useState(0);
    const [generalPoCount, setGeneralPoCount] = useState(0);




    useEffect(() => {
        // console.log("UseEffect dashboardCtx.isLoggedIn", +dashboardCtx.isLoggedIn);
        if (!(+dashboardCtx.isLoggedIn)) {
            navigate("/");
        }
    }, []);

    const navigateTo = (screen) => {
        // console.log("Navigate to:", screen);
        if (screen === "Fabric") {
            navigate("/Fabric")
        }

        if (screen === "Yarn") {
            navigate("/YarnPo")
        }

        if (screen === "PO") {
            navigate("/GeneralPo")
        }
    };

    const handleCompanyChange = () => {
        navigate("/", {
            state: { companySelect: true },
            replace: true
        });
    };

    const handleLogout = () => {
        // localStorage.clear();
        dashboardCtx.updateUsrName({
            UserName: null,
            isLoggedIn: "0",
            ServerIp: dashboardCtx.serverIp
        });
        navigate("/");
    };

    useEffect(() => {

        const fetchData = async () => {
            try {
                const data = {
                    ENAME: dashboardCtx.selectedCompany,
                    UNAM: dashboardCtx.userName
                }

                const data1 = {
                    UNAM: dashboardCtx.userName
                    // UNAM: "bss1"
                }

                const result = await getFabricApproval(serverIp, data);
                console.log("Fabric Result count :", result);

                if (result.MESSAGE === 'Success') {
                    const apiData = result.data;
                    const uniqueDocIds = [...new Set(apiData.map(item => item.DOCID))];
                    const count = uniqueDocIds.length;
                    // console.log("count => ", count)
                    setFabCount(count)
                }


                const result2 = await getYarnPoApproval(serverIp, data);
                console.log("Yarn Result count:", result2);

                if (result2.MESSAGE === 'Success') {
                    const apiData = result2.data;
                    const uniqueDocIds = [...new Set(apiData.map(item => item.DOCID))];
                    const count = uniqueDocIds.length;
                    // console.log("count => ", count)
                    setYarnPoCount(count)
                }


                const result3 = await getGeneralPoApproval(serverIp, data1);
                console.log("General Result count:", result3);

                if (result3.MESSAGE === 'Success') {
                    const apiData = result3.data;
                    const uniqueDocIds = [...new Set(apiData.map(item => item.DOCID))];
                    const count = uniqueDocIds.length;
                    console.log("count => ", count)
                    setGeneralPoCount(count)
                }
            } catch (error) {
                console.error("Error fetching fabric approval:", error);
            }
        };
        fetchData();

    }, []);

    return (
        <div className="layout-container">

            {/* ================= HEADER ================= */}
            <AppBarComponent cssClass="top-bar custom-appbar">
                <div className="appbar-container">

                    <div className="left-section">
                        <img src={logo2} alt="logo" className="company-logo" />
                        <span className="app-title">ERP Approval Reports</span>
                    </div>

                    <div className="right-section">

                        <div className="user-info">
                            {/* <span className="e-icons e-user user-icon"></span> */}
                            <User size={18} className="user-icon" />
                            <span className="username-text">{dashboardCtx.userName}</span>
                        </div>

                        {/* <ButtonComponent
                            content="Company"
                            cssClass="company-button"
                            iconCss="e-icons e-building"
                            iconPosition="Left"
                            onClick={handleCompanyChange}
                        />

                        <ButtonComponent
                            content="Logout"
                            cssClass="logout-button"
                            iconCss="e-icons e-logout"
                            iconPosition="Left"
                            onClick={handleLogout}
                        /> */}

                        <ButtonComponent
                            cssClass="company-button custom-btn"
                            onClick={handleCompanyChange}
                        >
                            <Building2 size={18} style={{ marginRight: "6px" }} />
                            Company
                        </ButtonComponent>

                        <ButtonComponent
                            cssClass="logout-button custom-btn"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} style={{ marginRight: "6px" }} />
                            LogOut
                        </ButtonComponent>
                    </div>

                </div>
            </AppBarComponent>

            {/* ================= DASHBOARD ================= */}
            <div className="dashboard-content">

                <div
                    className="dashboard-card card-indigo"
                    onClick={() => navigateTo("Fabric")}
                >
                    Fabric Order Approval  ( <span>{fabCount}</span>  )

                </div>

                <div
                    className="dashboard-card card-emerald"
                    onClick={() => navigateTo("PO")}
                >
                    PO Approval   ( <span>{generalPoCount}</span>  )
                </div>

                <div
                    className="dashboard-card card-amber"
                    onClick={() => navigateTo("Yarn")}
                >
                    Yarn Approval   ( <span>{yarnPoCount}</span>  )
                </div>

                <div
                    className="dashboard-card card-slate"
                    onClick={() => navigateTo("General")}
                >
                    General Approval
                </div>

            </div>

        </div>
    );
}

