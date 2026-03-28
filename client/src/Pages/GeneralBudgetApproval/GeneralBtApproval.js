import React, { useContext, useEffect, useRef, useState } from "react";
import CtxDashboard from "../../Interface/Dashboard-Context"
import logo2 from "../../Images/logo2.png";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "./GeneralBtApproval.css"
import { AppBarComponent } from "@syncfusion/ej2-react-navigations";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { getGeneralBudApproval} from "../../serverCommication/ServerPostApi"
import { Aggregate, AggregateColumnDirective, AggregateColumnsDirective, AggregateDirective, AggregatesDirective, ColumnDirective, ColumnsDirective, GridComponent, Inject, Resize, Sort, Filter, Group, } from "@syncfusion/ej2-react-grids";
import moment from "moment";

export default function GeneralAprroval() {

    const ctx = useContext(CtxDashboard);
    const serverIp = ctx.serverIp;

    const navigate = useNavigate();


    const gridRef = useRef(null);
    // const appdialogRef = useRef(null);
    // const rejdialogRef = useRef(null);
    const isSelectingRef = useRef(false);

    const [approvalData, setApprovalData] = useState([]);
    // const [appdialogVisible, setAppdialogVisible] = useState(false);
    // const [rejdialogVisible, setRejdialogVisible] = useState(false);
    // const [rejectReason, setRejectReason] = useState("");




    const formatDataForMerge = (data) => {
        let lastDocId = null;
        return data.map(row => {
            const newRow = {
                // ...row,
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



    useEffect(() => {

        const fetchData = async () => {
            try {
                const data = {                    
                    // UNAM: ctx.userName
                    UNAM : "bss1"
                }
                const result = await getGeneralBudApproval(serverIp, data);
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
                        <ColumnDirective field='DOCID' headerText="Bud No " textAlign="Center" />
                        <ColumnDirective field='DOCDATE' headerText="Bud Date" textAlign="Center" format="dd/MM/yyyy" type="date" />
                        <ColumnDirective field='ENAME' headerText="Company" textAlign="Center" />
                        <ColumnDirective field='FABNAME' headerText="Budget Month" textAlign="Center" />
                        <ColumnDirective field='COLOR' headerText="Budget Val" textAlign="Center" format="N2" />
                        <ColumnDirective field='ORDQTY' headerText="Costing Avg Value / Month" textAlign="Center" />
                        <ColumnDirective field='OLOSSPER' headerText="Budget" textAlign="Center" />
                        <ColumnDirective field='PRODQTY' headerText="Budget vs Costing" textAlign="Center" />
                        <ColumnDirective field='RATE' headerText="Prev. Budget value" textAlign="Center" format="N2" />
                        <ColumnDirective field='APPTYPE' headerText="Approval Type" textAlign="Center" />
                        <ColumnDirective field='BUDVAL' headerText="Amendment Details" textAlign="Center" />
                    </ColumnsDirective>

                    {/* <AggregatesDirective>
                        <AggregateDirective>
                            <AggregateColumnsDirective>
                                <AggregateColumnDirective field="DOCDATE" type="Count" groupFooterTemplate={totalLabelTemplate} /> */}
                                {/* <AggregateColumnDirective field="ORDQTY" type="Sum" groupFooterTemplate={groupFooterTemplate} />
                                <AggregateColumnDirective field="OLOSSPER" type="Sum" groupFooterTemplate={groupFooterTemplate} />
                                <AggregateColumnDirective field="PRODQTY" type="Sum" groupFooterTemplate={groupFooterTemplate} /> */}
                            {/* </AggregateColumnsDirective>
                        </AggregateDirective>
                    </AggregatesDirective> */}

                    <Inject services={[Sort, Filter, Group, Resize, Aggregate]} />
                </GridComponent>

            </div>

        </div>
    );
}