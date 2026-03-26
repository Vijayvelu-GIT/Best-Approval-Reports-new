import React, { useContext, useRef } from "react";
import CtxDashboard from "../../Interface/Dashboard-Context"
import { AppBarComponent, Inject } from "@syncfusion/ej2-react-navigations";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import logo2 from "../../Images/logo2.png";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "./YarnPoApproval.css"
import { Aggregate, AggregateColumnDirective, AggregateColumnsDirective, AggregateDirective, AggregatesDirective, ColumnDirective, ColumnsDirective, GridComponent, Resize, Sort, Filter,Group } from "@syncfusion/ej2-react-grids";

export default function YarnApproval() {


    const ctx = useContext(CtxDashboard);
    const serverIp = ctx.serverIp;

    const gridRef = useRef(null);
    const isSelectingRef = useRef(false);

    const navigate = useNavigate();


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

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    const dataBound = () => {
        if (gridRef.current) {
            gridRef.current.autoFitColumns();
        }
    };


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
                    // dataSource={approvalData}
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
                        <ColumnDirective field='FABNAME' headerText="Po Forward By" textAlign="Center" />
                        <ColumnDirective field='DOCID' headerText="DOC ID " textAlign="Center" />                        
                        <ColumnDirective field='DOCDATE' headerText="Doc Date" textAlign="Center" format="dd/MM/yyyy" type="date" />
                        <ColumnDirective field='PARTYID' headerText="Party Name" textAlign="Center" />                        
                        <ColumnDirective field='COLOR' headerText="Po Value" textAlign="Center" />
                        <ColumnDirective field='ORDQTY' headerText="Po Toatal Qty" textAlign="Center" />
                    </ColumnsDirective>

                    <AggregatesDirective>
                        <AggregateDirective>
                            <AggregateColumnsDirective>
                                <AggregateColumnDirective field="DOCDATE" type="Count" />
                                <AggregateColumnDirective field="ORDQTY" type="Sum" />
                                <AggregateColumnDirective field="OLOSSPER" type="Sum" />
                                <AggregateColumnDirective field="PRODQTY" type="Sum" />
                            </AggregateColumnsDirective>
                        </AggregateDirective>
                    </AggregatesDirective>

                    <Inject services={[Sort, Filter, Group, Resize, Aggregate]} />
                </GridComponent>

            </div>


        </div>
    );
}