import React, { useEffect, useState, useRef } from "react";
import {
    GridComponent,
    ColumnsDirective,
    ColumnDirective,
    Inject,
    Sort,
    Filter,
    Group
} from "@syncfusion/ej2-react-grids";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { AppBarComponent } from "@syncfusion/ej2-react-navigations";
import "./FabricOrderApproval.css";
import logo2 from "../Images/logo2.png";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { getFabricApproval, insertFabricApproval, rejectFabricApproval } from "../serverCommication/ServerPostApi"
export default function FabricApproval() {

    const gridRef = useRef(null);


    const [approvalData, setApprovalData] = useState([])
    const navigate = useNavigate();

    const serverIp = "http://localhost:5056";


    useEffect(() => {

        const fetchData = async () => {
            try {
                const data = {
                    ENAME: 'BEST TECH APPARELS PRIVATE LIMITED(KNITTING)',
                    UNAM: 'bss'
                }
                const result = await getFabricApproval(serverIp, data);
                console.log("Result:", result);

                if (result.MESSAGE === 'Success') {

                    setApprovalData(
                        result.data.map(item => ({
                            ...item,
                            DOCDATE: moment(item.DOCDATE).toDate()
                        }))
                    );
                } else {
                    // alert("")
                }
            } catch (error) {
                console.error("Error fetching fabric approval:", error);
            }
        };
        fetchData();
    }, []);



    const handleApproval = () => {

        const selectedRecords = gridRef.current.getSelectedRecords();

        if (selectedRecords.length === 0) {
            alert("Please select at least one record");
            return;
        }

        const data = {
            selectedRecords: selectedRecords,
            username: "bss"
        }

        console.log(selectedRecords, "selectedRecords")

        insertFabricApproval(serverIp, data)
            .then((result) => {
                if (result.STATUS) {
                    console.log(result);
                    alert(result.MESSAGE)
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };


    const handleReject = () => {

        const selectedRecords = gridRef.current.getSelectedRecords();

        if (selectedRecords.length === 0) {
            alert("Please select at least one record");
            return;
        }

        const data = {
            selectedRecords: selectedRecords,
            username: "bss"
        }
        rejectFabricApproval(serverIp, data)
            .then((result) => {
                if (result.STATUS) {
                    console.log(result);
                    alert(result.MESSAGE)
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };


    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="page-container">

            {/* 🔵 Top App Bar */}
            <AppBarComponent cssClass="top-bar custom-appbar">
                <div className="appbar-container">

                    <div className="left-section">
                        <img src={logo2} alt="logo" className="company-logo" />
                        <span className="app-title">Fabric Order Approval</span>
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


            {/* 🔵 Grid Section */}
            <div className="grid-wrapper">

                <GridComponent
                    ref={gridRef}
                    dataSource={approvalData}
                    gridLines="Both"
                    height="600"
                    // allowPaging={true}
                    allowSelection={true}
                    selectionSettings={{ type: "Multiple", checkboxOnly: true }}
                >
                    <ColumnsDirective>
                        <ColumnDirective type="checkbox" width="50" />
                        <ColumnDirective field='DOCID' headerText="Doc ID" width='180' textAlign="Center" />
                        <ColumnDirective
                            field='DOCDATE'
                            headerText="Doc Date"
                            width='150'
                            textAlign="Center"
                            format="yMd"
                            type="date"
                        />
                        <ColumnDirective field='PARTYID' headerText="Party Name" width='250' />
                        <ColumnDirective field='FABNAME' headerText="Fabric Name" width='250' />
                        <ColumnDirective field='COLOR' headerText="Colour" width='120' textAlign="Center" />
                        <ColumnDirective field='ORDQTY' headerText="Ord Qty" width='120' textAlign="Right" />
                        <ColumnDirective field='OLOSSPER' headerText="Loss %" width='120' textAlign="Right" />
                        <ColumnDirective field='PRODQTY' headerText="Prod Qty" width='120' textAlign="Right" />
                        <ColumnDirective
                            field='RATE'
                            headerText="Sale Rate"
                            width='120'
                            textAlign="Right"
                            format="N2"
                        />
                        <ColumnDirective
                            field='ORDVAL'
                            headerText="Order Value"
                            width='140'
                            textAlign="Right"
                            format="N2"
                        />
                        <ColumnDirective
                            field='BUDVAL'
                            headerText="Budget Value"
                            width='140'
                            textAlign="Right"
                            format="N2"
                        />
                        <ColumnDirective
                            field='DIFF'
                            headerText="Difference"
                            width='140'
                            textAlign="Right"
                            format="N2"
                        />
                        <ColumnDirective
                            field='PRPER'
                            headerText="Profit %"
                            width='120'
                            textAlign="Right"
                        />
                    </ColumnsDirective>

                    <Inject services={[Sort, Filter, Group]} />
                </GridComponent>

            </div>

            <div className="buttons">

                <ButtonComponent
                    content="Approval"
                    cssClass="e-success medium-btn"
                    onClick={handleApproval}
                />

                <ButtonComponent
                    content="Reject"
                    cssClass="e-reject medium-btn"
                    onClick={handleReject}
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
