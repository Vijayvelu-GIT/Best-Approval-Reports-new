import React, { useContext, useEffect, useRef, useState } from "react";
import CtxDashboard from "../../Interface/Dashboard-Context"
import { AppBarComponent, Inject } from "@syncfusion/ej2-react-navigations";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import logo2 from "../../Images/logo2.png";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "./YarnPoApproval.css"
import { Aggregate, AggregateColumnDirective, AggregateColumnsDirective, AggregateDirective, AggregatesDirective, ColumnDirective, ColumnsDirective, GridComponent, Resize, Sort, Filter, Group } from "@syncfusion/ej2-react-grids";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import { getYarnPoApproval, insertYarnPoApproval, rejectYarnPoApproval } from "../../serverCommication/ServerPostApi"
import moment from "moment";


export default function YarnApproval() {


    const ctx = useContext(CtxDashboard);
    const serverIp = ctx.serverIp;

    const gridRef = useRef(null);
    const isSelectingRef = useRef(false);
    const appdialogRef = useRef(null);
    // const rejdialogRef = useRef(null);
    const navigate = useNavigate();


    const [approvalData, setApprovalData] = useState([]);
    const [appdialogVisible, setAppdialogVisible] = useState(false);
    // const [rejdialogVisible, setRejdialogVisible] = useState(false);
    // const [rejectReason, setRejectReason] = useState("");



    const formatDataForMerge = (data) => {
        let lastDocId = null;
        return data.map(row => {
            const newRow = {
                ...row,
                ORDVAL_ORG: row.ORDVAL,
                BUDVAL_ORG: row.BUDVAL,
                DIFF_ORG: row.DIFF,
                PRPER_ORG: row.PRPER
            };
            if (row.DOCID === lastDocId) {
                newRow.ORDVAL = "";
                newRow.BUDVAL = "";
                newRow.DIFF = "";
                newRow.PRPER = "";
            }
            lastDocId = row.DOCID;
            return newRow;
        });
    };



    // get api calling for fgrid

    useEffect(() => {

        const fetchData = async () => {
            try {
                const data = {
                    ENAME: ctx.selectedCompany,
                    UNAM: ctx.userName
                }
                const result = await getYarnPoApproval(serverIp, data);
                console.log("Result:", result);

                if (result.MESSAGE === 'Success') {

                    const formattedData = formatDataForMerge(
                        result.data.map(item => ({
                            ...item,
                            DOCDATE: moment(item.DOCDATE).toDate()
                        }))
                    );
                    setApprovalData(formattedData);
                } else {
                    // alert("")
                }
            } catch (error) {
                console.error("Error fetching fabric approval:", error);
            }
        };
        fetchData();
        // const formattedData = formatDataForMerge(dummyData);

        // setApprovalData(formattedData);

    }, []);



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

        const correctedRecords = selectedRecords.map(row => ({
            ...row,
            ORDVAL: row.ORDVAL_ORG,
            BUDVAL: row.BUDVAL_ORG,
            DIFF: row.DIFF_ORG,
            PRPER: row.PRPER_ORG
        }));

        // console.log("Correct data => ", correctedRecords);

        const data = {
            selectedRecords: correctedRecords,
            username: ctx.userName
        };

        // console.log("data => ", data)

        insertYarnPoApproval(serverIp, data).then((result) => {
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

    // const handleReject = () => {

    //     console.log("checking")

    //     const selectedRecords = gridRef.current.getSelectedRecords();

    //     if (selectedRecords.length === 0) {
    //         alert("Please select at least one record");
    //         return;
    //     }
    //     setRejdialogVisible(true);

    // };

    // useEffect(() => {
    //     if (rejdialogVisible) {
    //         rejdialogRef.current.show();
    //     }
    // }, [rejdialogVisible]);


    // const confirmReject = () => {

    //     const selectedRecords = gridRef.current.getSelectedRecords();

    //     if (!rejectReason.trim()) {
    //         alert("Please enter reject reason");
    //         return;
    //     }

    //     const data = {
    //         selectedRecords: selectedRecords,
    //         username: ctx.userName,
    //         reason: rejectReason
    //     };

    //     // console.log("data => ", data)

    //     rejectYarnPoApproval(serverIp, data).then((result) => {
    //         // console.log("result => ", result)
    //         if (result.STATUS === true) {
    //             setRejdialogVisible(false);
    //             alert(result.MESSAGE);
    //             setRejectReason("");
    //             setTimeout(() => {
    //                 window.location.reload();
    //             }, 100);
    //         }
    //     })
    //         .catch((error) => {
    //             console.error(error);
    //             setRejdialogVisible(false);
    //         });
    // };

    // const cancelReject = () => {
    //     setRejdialogVisible(false);
    // };



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


    //Logout Function
    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const dataBound = () => {
        if (gridRef.current) {
            gridRef.current.autoFitColumns();
        }
    };


    const totalLabelTemplate = () => (
        <span style={{ fontWeight: "bold" }}>Total : </span>
    );

    const groupFooterTemplate = (props) => (
        <span style={{ float: "right", fontWeight: "bold" }}>
            {props.Sum}
        </span>
    );


    return (
        <div className="page-containeryarn">
            <AppBarComponent cssClass="top-bar custom-appbar">
                <div className="appbar-containeryarn">

                    <div className="left-section">
                        <img src={logo2} alt="logo" className="company-logo" />
                        <span className="app-title">Yarn Po Approval</span>
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
                    onClick={handleApproval}
                />

                {/* <ButtonComponent
                    content="Reject"
                    cssClass="e-reject medium-btn"
                    onClick={handleReject}
                /> */}

                <ButtonComponent
                    content="Back"
                    cssClass="e-danger medium-btn"
                    onClick={() => navigate(-1)}
                />

            </div>


            <div className="grid-wrapper">
                <GridComponent
                    ref={gridRef}
                    dataBound={dataBound}
                    dataSource={approvalData}
                    gridLines="Both"
                    height="600"
                    allowResizing={true}
                    allowSelection={true}
                    rowSelecting={onRowSelecting}
                    rowDeselected={onRowDeselected}
                    selectionSettings={{ type: "Multiple", checkboxOnly: true }}
                    clipMode="EllipsisWithTooltip"
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
                        <ColumnDirective type="checkbox" width="50" />
                        <ColumnDirective field='CREATEDBY' headerText="Po Forward By" textAlign="Center" />
                        <ColumnDirective field='DOCID' headerText="DOC ID " textAlign="Center" />
                        <ColumnDirective field='DOCDATE' headerText="Doc Date" textAlign="Center" format="dd/MM/yyyy" type="date" />
                        <ColumnDirective field='PARTYID' headerText="Party Name" textAlign="Center" />
                        <ColumnDirective field='POVALUE' headerText="Po Value" textAlign="Center" />
                        <ColumnDirective field='REJECT' headerText="Reject" textAlign="Center" />
                        <ColumnDirective field='TOTPOQTY' headerText="Po Toatal Qty" textAlign="Center" />
                    </ColumnsDirective>

                    <AggregatesDirective>
                        <AggregateDirective>
                            <AggregateColumnsDirective>
                                <AggregateColumnDirective field="DOCDATE" type="Count" groupFooterTemplate={totalLabelTemplate}/>
                                <AggregateColumnDirective field="POVALUE" type="Sum" groupFooterTemplate={groupFooterTemplate}/>                                
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
                target=".page-containeryarn"
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


            {/* <DialogComponent
                ref={rejdialogRef}
                header="Reject Confirmation"
                visible={rejdialogVisible}
                width="400px"
                target=".page-containeryarn"
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
            </DialogComponent> */}


        </div>
    );
}