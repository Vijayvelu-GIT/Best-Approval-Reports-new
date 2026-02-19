// import React from "react";
// import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
// import { AppBarComponent } from "@syncfusion/ej2-react-navigations";
// import { MenuComponent } from "@syncfusion/ej2-react-navigations";
// import "./HomePage.css";

// export default function Home() {
//     const navigateTo = (screen) => {
//         console.log("Navigate to:", screen);
//     };

//     const profileItems = [
//         // { text: "My Profile" },
//         // { text: "Settings" },
//         // { separator: true },
//         { text: "Logout" }
//     ];

//     const cards = [
//         { label: "Home", icon: "e-home", screen: "home" },
//         { label: "Orders", icon: "e-shopping-cart", screen: "orders" },
//         { label: "Reports", icon: "e-chart", screen: "reports" },
//         { label: "Settings", icon: "e-settings", screen: "settings" },
//     ];

//     return (
//         //----------------------------style 2-------------------------------------------
//         <div className="layout-container">

//             {/* 🔷 Top Navigation */}
//             <AppBarComponent colorMode="Primary" cssClass="top-bar">

//                 <div className="left-section">
//                     <span className="logo">🏢</span>
//                     <span className="app-title">Company ERP</span>
//                 </div>

//                 <div className="right-section">

//                     <ButtonComponent
//                         iconCss="e-icons e-bell"
//                         cssClass="e-flat"
//                     />

//                     <MenuComponent
//                         items={profileItems}
//                         cssClass="profile-menu"
//                     >
//                         <div className="profile-area">
//                             <span className="profile-avatar">V</span>
//                             <span className="profile-name">Vijay</span>
//                             <span className="e-icons e-caret-down"></span>
//                         </div>
//                     </MenuComponent>

//                 </div>
//             </AppBarComponent>

//             {/* 🔷 Main Content */}
//             <div className="dashboard-content">

//                 <div
//                     className="dashboard-card"
//                     onClick={() => navigateTo("Orders")}
//                 >
//                     Orders
//                 </div>

//                 <div
//                     className="dashboard-card"
//                     onClick={() => navigateTo("Reports")}
//                 >
//                     Reports
//                 </div>

//                 <div
//                     className="dashboard-card"
//                     onClick={() => navigateTo("Stock")}
//                 >
//                     Stock
//                 </div>

//                 <div
//                     className="dashboard-card"
//                     onClick={() => navigateTo("Users")}
//                 >
//                     Users
//                 </div>

//             </div>

//         </div>


//------------------------------style 1----------------------------
// <div className="dashboard-container">
//     <AppBarComponent colorMode="Primary">
//         <h3 style={{ marginLeft: "15px" }}>My Application</h3>
//     </AppBarComponent>

//     <div className="card-grid">
//         {cards.map((card, index) => (
//             <div
//                 key={index}
//                 className="dashboard-card"
//                 onClick={() => navigateTo(card.screen)}
//             >
//                 <span className={`e-icons ${card.icon} card-icon`}></span>
//                 <h4>{card.label}</h4>
//                 <ButtonComponent
//                     cssClass="e-flat e-primary"
//                     content="Open"
//                 />
//             </div>
//         ))}
//     </div>
// </div>
// <div className="home-container">
//     <div className="home-header">
//         <h1>Best Approval Reports</h1>
//     </div>
//     <div className="button-column">
//         <ButtonComponent content="fabric Order Approval" cssClass="big-btn btn1" />
//         <ButtonComponent content="PO Approval" cssClass="big-btn btn2" />
//         <ButtonComponent content="Yarn Approval" cssClass="big-btn btn3" />
//         <ButtonComponent content="General Approval" cssClass="big-btn btn4" />
//     </div>
// </div>
//     );
// }




// import React from "react";
// import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
// import { AppBarComponent, MenuComponent } from "@syncfusion/ej2-react-navigations";
// import "./HomePage.css";
// import logo2 from "../Images/logo2.png";// your logo path

// export default function Home() {

//     const navigateTo = (screen) => {
//         console.log("Navigate to:", screen);
//     };

//     const profileItems = [
//         // { text: "My Profile" },
//         // { text: "Change Password" },
//         // { separator: true },
//         { text: "Logout" }
//     ];

//     return (
//         <div className="layout-container">           

//             <AppBarComponent cssClass="top-bar custom-appbar">
//                 <div className="appbar-container">

//                     <div className="left-section">
//                         <img src={logo2} alt="logo" className="company-logo" />
//                         <span className="app-title">Company ERP</span>
//                     </div>

//                     <div className="right-section">

//                         <ButtonComponent
//                             content="Logout"
//                             cssClass="logout-button"
//                             iconCss="e-icons e-logout"                            
//                             onClick={() => console.log("Logout clicked")}
//                         />

//                     </div>

//                 </div>
//             </AppBarComponent>

//             {/* 🔷 Dashboard Cards */}
//             <div className="dashboard-content">

//                 <div className="dashboard-card card-indigo" onClick={() => navigateTo("Orders")}>
//                     <span className="e-icons  card-icon"></span>
//                     <h3>fabric Order Approval</h3>
//                     {/* <p>Manage customer orders</p> */}
//                 </div>

//                 <div className="dashboard-card card-emerald" onClick={() => navigateTo("Reports")}>
//                     <span className="e-icons card-icon"></span>
//                     <h3>PO Approval</h3>
//                     {/* <p>View business analytics</p> */}
//                 </div>

//                 <div className="dashboard-card card-amber" onClick={() => navigateTo("Stock")}>
//                     <span className="e-icons  card-icon"></span>
//                     <h3>Yarn Approval</h3>
//                     {/* <p>Inventory management</p> */}
//                 </div>

//                 <div className="dashboard-card card-slate" onClick={() => navigateTo("Users")}>
//                     <span className="e-icons  card-icon"></span>
//                     <h3>General Approval</h3>
//                     {/* <p>User access control</p> */}
//                 </div>

//             </div>

//         </div>
//     );
// }



import React, { useContext, useEffect } from "react";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { AppBarComponent } from "@syncfusion/ej2-react-navigations";
import "./HomePage.css";
import logo2 from "../Images/logo2.png";
import { useNavigate } from "react-router-dom";
import CtxDashboard from "../Interface/Dashboard-Context";

export default function Home() {
    const navigate = useNavigate();
    const dashboardCtx = useContext(CtxDashboard);

    console.log("dashboardCtx.isLoggedIn", +dashboardCtx.isLoggedIn);
    useEffect(() => {
        console.log("UseEffect dashboardCtx.isLoggedIn", +dashboardCtx.isLoggedIn);
        if (!(+dashboardCtx.isLoggedIn)) {
            navigate("/");
        }
    }, []);

    const navigateTo = (screen) => {
        console.log("Navigate to:", screen);
        if (screen === "Fabric") {
            navigate("/Fabric")
        }
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
                        <ButtonComponent
                            content="Logout"
                            cssClass="logout-button"
                            iconCss="e-icons e-logout"
                            iconPosition="Left"
                            onClick={handleLogout}
                        />
                    </div>

                </div>
            </AppBarComponent>

            {/* ================= DASHBOARD ================= */}
            <div className="dashboard-content">

                <div
                    className="dashboard-card card-indigo"
                    onClick={() => navigateTo("Fabric")}
                >
                    Fabric Order Approval
                </div>

                <div
                    className="dashboard-card card-emerald"
                    onClick={() => navigateTo("PO")}
                >
                    PO Approval
                </div>

                <div
                    className="dashboard-card card-amber"
                    onClick={() => navigateTo("Yarn")}
                >
                    Yarn Approval
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

