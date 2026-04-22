import React, { useContext, useEffect, useRef, useState } from "react";
import CtxDashboard from "../../Interface/Dashboard-Context"
import logo2 from "../../Images/logo2.png";
import { useNavigate } from "react-router-dom";
import { User, Building2, LogOut } from "lucide-react";
import "./GeneralPoApproval.css"
import { AppBarComponent } from "@syncfusion/ej2-react-navigations";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { getGeneralPoApproval, insertGeneralPoApproval, insertGeneralPoReject } from "../../serverCommication/ServerPostApi"
import { Aggregate, AggregateColumnDirective, AggregateColumnsDirective, AggregateDirective, AggregatesDirective, ColumnDirective, ColumnsDirective, GridComponent, Inject, Resize, Sort, Filter, Group, } from "@syncfusion/ej2-react-grids";
import moment from "moment";
import { DialogComponent } from "@syncfusion/ej2-react-popups";

export default function GeneralPoAprroval() {

    const ctx = useContext(CtxDashboard);
    const serverIp = ctx.serverIp;

    const navigate = useNavigate();


    const gridRef = useRef(null);
    const appdialogRef = useRef(null);
    const rejdialogRef = useRef(null);
    const isSelectingRef = useRef(false);

    const [approvalData, setApprovalData] = useState([]);
    const [appdialogVisible, setAppdialogVisible] = useState(false);
    const [rejdialogVisible, setRejdialogVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState("");


    useEffect(() => {

        const fetchData = async () => {
            try {
                const data = {
                    UNAM: ctx.userName
                    // UNAM: "bss1"
                }
                const result = await getGeneralPoApproval(serverIp, data);
                console.log("General Result:", result);

                if (result.MESSAGE === 'Success') {
                    const formattedData = result.data.map(item => ({
                        ...item,
                        DOCDATE: moment(item.DOCDATE).toDate()
                    }))
                    setApprovalData(formattedData);
                } else {
                    // alert("")
                }
            } catch (error) {
                console.error("Error fetching fabric approval:", error);
            }
        };
        fetchData();

    }, []);



    //Logout Function
    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const dataBound = () => {
        if (gridRef.current) {
            gridRef.current.autoFitColumns();
        }
    }



    // Multiple check box Select :----------------------------------------

    const onRowSelecting = (args) => {
        if (!gridRef.current) return;
        if (isSelectingRef.current) return;
        isSelectingRef.current = true;
        const grid = gridRef.current;
        const docId = args.data.DOCID;

        let selectedIndexes = grid.getSelectedRowIndexes() || [];

        const indexes = [];

        grid.getCurrentViewRecords().forEach((item, index) => {
            if (item.DOCID === docId) {
                indexes.push(index);
            }
        });
        grid.selectRows(indexes);

        const mergedIndexes = [...new Set([...selectedIndexes, ...indexes])];

        // select merged indexes
        grid.selectRows(mergedIndexes);

        isSelectingRef.current = false;
    };

    // Multiple check box Deselect :----------------------------------------

    const onRowDeselected = (args) => {
        if (!gridRef.current) return;
        const grid = gridRef.current;
        if (!args || !args.data) return;
        const deselectedDocId = args.data.DOCID;
        grid.getCurrentViewRecords().forEach((record, index) => {
            if (record.DOCID === deselectedDocId) {
                grid.selectRows(grid.getSelectedRowIndexes().filter(i =>
                    grid.getCurrentViewRecords()[i].DOCID !== deselectedDocId
                ));
            }
        });
    };




    const totalLabelTemplate = () => (
        <span style={{ fontWeight: "bold" }}>Total : </span>
    );

    const groupFooterTemplate = (props) => (
        <span style={{ float: "right", fontWeight: "bold" }}>
            {props.Sum}
        </span>
    );




    // Report Approval functionalty :-------------------------

    const handleApproval = () => {

        const selectedRecords = gridRef.current.getSelectedRecords();

        if (selectedRecords.length === 0) {
            alert("Please select at least one record");
            return;
        };

        setAppdialogVisible(true);

    };

    useEffect(() => {
        if (appdialogVisible) {
            appdialogRef.current.show();
        }
    }, [appdialogVisible]);


    const confirmApproval = () => {

        const selectedRecords = gridRef.current.getSelectedRecords();

        if (selectedRecords.length === 0) {
            alert("No records selected");
            return;
        }

        // const correctedRecords = selectedRecords.map(row => ({
        //     ...row,
        //     ORDVAL: row.ORDVAL_ORG,
        //     BUDVAL: row.BUDVAL_ORG,
        //     DIFF: row.DIFF_ORG,
        //     PRPER: row.PRPER_ORG
        // }));

        console.log("selectedRecords => ", selectedRecords);

        const data = {
            selectedRecords: selectedRecords,
            username: ctx.userName
        };

        console.log("data => ", data)

        insertGeneralPoApproval(serverIp, data).then((result) => {
            if (result.STATUS) {
                setAppdialogVisible(false);
                alert(result.MESSAGE);
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            }
        })
            .catch((error) => {
                console.error(error);
                setAppdialogVisible(false);
            });
    };

    const cancelApproval = () => {
        setAppdialogVisible(false);
    };


    // Report Reject functionalty :---------------------------------------

    const handleReject = () => {

        console.log("checking")

        const selectedRecords = gridRef.current.getSelectedRecords();

        if (selectedRecords.length === 0) {
            alert("Please select at least one record");
            return;
        }
        setRejdialogVisible(true);

    };

    useEffect(() => {
        if (rejdialogVisible) {
            rejdialogRef.current.show();
        }
    }, [rejdialogVisible]);


    const confirmReject = () => {

        const selectedRecords = gridRef.current.getSelectedRecords();

        if (!rejectReason.trim()) {
            alert("Please enter reject reason");
            return;
        }

        const data = {
            selectedRecords: selectedRecords,
            username: ctx.userName,
            reason: rejectReason
        };

        // console.log("data => ", data)

        insertGeneralPoReject(serverIp, data).then((result) => {
            // console.log("result => ", result)
            if (result.STATUS === true) {
                setRejdialogVisible(false);
                alert(result.MESSAGE);
                setRejectReason("");
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            }
        })
            .catch((error) => {
                console.error(error);
                setRejdialogVisible(false);
            });
    };

    const cancelReject = () => {
        setRejdialogVisible(false);
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
                            cssClass="logout-button custom-btn"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} style={{ marginRight: "6px" }} />
                            LogOut
                        </ButtonComponent>
                    </div>

                </div>
            </AppBarComponent>

            <div className="buttons">

                <ButtonComponent
                    content="Approve"
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

            <div className="grid-wrapper">
                <GridComponent
                    ref={gridRef}
                    // dataBound={dataBound}
                    dataSource={approvalData}
                    gridLines="Both"
                    height="680"
                    allowResizing={true}
                    allowSelection={true}
                    rowSelecting={onRowSelecting}
                    rowDeselected={onRowDeselected}
                    selectionSettings={{ type: "Multiple", checkboxOnly: true }}
                    // clipMode="EllipsisWithTooltip"
                    clipMode="Clip"
                    allowTextWrap={true}
                    textWrapSettings={{ wrapMode: 'Content' }}
                    allowGrouping={true}
                    groupSettings={{
                        columns: ['DOCID'],
                        showDropArea: false,
                        showGroupedColumn: false
                    }}
                // queryCellInfo={queryCellInfo}
                // enableRowSpan={true}
                >
                    <ColumnsDirective>
                        <ColumnDirective type="checkbox" width="25" />
                        <ColumnDirective field='CREATEDBY' headerText="Po Created By" textAlign="Center" width="100" />
                        <ColumnDirective field='DOCID' headerText="Doc ID" textAlign="Center" width="100"/>
                        <ColumnDirective field='DOCDATE' headerText="Doc Date" textAlign="Center" format="dd/MM/yyyy" type="date" width="80" />
                        <ColumnDirective field='POAGT' headerText="Po Against" textAlign="Center" format="N2" width="100"/>
                        <ColumnDirective field='PARTYID' headerText="Party Name" textAlign="Center" width="140"/>
                        <ColumnDirective field='REMARKS' headerText="Remarks" textAlign="Left" format="N2" width="180"/>
                        <ColumnDirective field='TRIMNAME' headerText="Acc Name" textAlign="Left" width="180"/>
                        <ColumnDirective field='TOTQTY' headerText="Quantity" textAlign="Center" width="80"/>
                        <ColumnDirective field='NET' headerText="Po Value" textAlign="Center" width="80" />                        
                        <ColumnDirective field='BUDTYPE' headerText="Budget Type" textAlign="Center" width="100" />
                    </ColumnsDirective>

                    <AggregatesDirective>
                        <AggregateDirective>
                            <AggregateColumnsDirective>
                                <AggregateColumnDirective field="DOCDATE" type="Count" groupFooterTemplate={totalLabelTemplate} />
                                <AggregateColumnDirective field="TOTQTY" type="Sum" groupFooterTemplate={groupFooterTemplate} />
                                <AggregateColumnDirective field="NET" type="Sum" groupFooterTemplate={groupFooterTemplate} />
                            </AggregateColumnsDirective>
                        </AggregateDirective>
                    </AggregatesDirective>

                    <Inject services={[Sort, Filter, Group, Resize, Aggregate]} />
                </GridComponent>

            </div>


            <DialogComponent
                ref={appdialogRef}
                header="Approval Confirmation"
                visible={appdialogVisible}
                width="350px"
                target=".page-containergeneral"
                isModal={true}
                // showCloseIcon={true}
                cssClass="custom-dialog"
                close={cancelApproval}
                animationSettings={{ effect: "Zoom" }}
                footerTemplate={() => (
                    <div className="dialog-footer">
                        <ButtonComponent
                            content="✔ Yes"
                            cssClass="e-success dialog-btn"
                            onClick={confirmApproval}
                        />
                        <ButtonComponent
                            content="✖ No"
                            cssClass="e-danger dialog-btn"
                            onClick={cancelApproval}
                        />
                    </div>
                )}
            >
                <div className="dialog-content">
                    {/* <div className="dialog-icon">⚠</div> */}
                    <div>
                        {/* <div className="dialog-title">
                                        Approval Confirmation
                                    </div> */}
                        <div className="dialog-message">
                            Are you sure you want to approve the selected records?
                        </div>
                    </div>
                </div>
            </DialogComponent>


            <DialogComponent
                ref={rejdialogRef}
                header="Reject Confirmation"
                visible={rejdialogVisible}
                width="400px"
                target=".page-containergeneral"
                isModal={true}
                cssClass="custom-dialog"
                close={cancelReject}
                animationSettings={{ effect: "Zoom" }}
                footerTemplate={() => (
                    <div className="dialog-footer">
                        <ButtonComponent
                            content="✔ Reject"
                            cssClass="e-success dialog-btn"
                            onClick={confirmReject}
                        />
                        <ButtonComponent
                            content="✖ Cancel"
                            cssClass="e-danger dialog-btn"
                            onClick={cancelReject}
                        />
                    </div>
                )}
            >
                <div className="dialog-content-column">

                    <div className="dialog-message">
                        Please enter reject reason:
                    </div>

                    <textarea
                        className="reject-textarea"
                        placeholder="Enter reject reason..."
                        // value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={4}
                    />

                </div>
            </DialogComponent>

        </div>
    );
}