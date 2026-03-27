import React, { useContext, useEffect, useRef, useState } from "react";
import CtxDashboard from "../../Interface/Dashboard-Context"
import logo2 from "../../Images/logo2.png";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "./GeneralBtApproval.css"
import { AppBarComponent } from "@syncfusion/ej2-react-navigations";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";

export default function GeneralAprroval() {

    const ctx = useContext(CtxDashboard);
    const serverIp = ctx.serverIp;

    const navigate = useNavigate();



    //Logout Function
    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="page-containergeneral">
            <AppBarComponent cssClass="top-bar custom-appbar">
                <div className="appbar-containergeneral">

                    <div className="left-section">
                        <img src={logo2} alt="logo" className="company-logo" />
                        <span className="app-title">General Approval</span>
                    </div>

                    <div className="right-section">
                        <div className="user-info">
                            {/* <span className="e-icons e-user user-icon"></span> */}
                            <User size={18} className="user-icon" />
                            <span className="username-text">{ctx.userName}</span>
                        </div>
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

            <div className="buttons">

                <ButtonComponent
                    content="Approve"
                    cssClass="e-success medium-btn"
                // onClick={handleApproval}
                />

                <ButtonComponent
                    content="Reject"
                    cssClass="e-reject medium-btn"
                    // onClick={handleReject}
                />

                <ButtonComponent
                    content="Back"
                    cssClass="e-danger medium-btn"
                    onClick={() => navigate(-1)}
                />

            </div>

        </div>
    );
}