const oracledb = require("oracledb");
const dbconfig = require("./dbconfig");

async function getYarnPoApprovalSelect(data, res) {
    let connection, sql, binds, options
    try {
        connection = await oracledb.getConnection(dbconfig);

        sql = `SELECT A.*, 'Reject' REJECT, 'Multiple' APPTYPE, 'tYarnP' TSIDNEW,  ACCPOMASID RECORDID
        FROM (SELECT   A.YARNPOMASID ACCPOMASID,  EX.COMPANYID ENAME, A.DOCID, A.DOCDATE,
        'YARNPOMAS' TNAME, A.CREATEDBY, A.CREATEDON, B.PARTYID, 'Yarn Purchase Order' SNAME, A.TOTPOQTY, 
        A.APPLEVEL + 1 APPLEV, A.NET POVALUE, A.DOCMAXNO, A.FINYEAR, A.REASON,MAXLEVEL  FROM   YARNPOMAS A,COMPMAS EX, 
        PARTYMAS B ,(SELECT YARNPOMASID,B.APPTYPE FROM YARNPODET A,FORDEMAS B WHERE A.ORDNOS=B.FORDEMASID AND 
        A.YARNPODETROW=1)S WHERE A.ENAME = EX.COMPMASID  AND EX.COMPANYID = :EXPNAME  AND A.PARTYID = B.PARTYMASID 
        AND A.REQUEST = 'T' AND A.YARNPOMASID=S.YARNPOMASID AND A.CANCEL = 'F' AND (APPLEVEL + 1 = (SELECT 
        DISTINCT APPLEVEL FROM   APPRMAS A1, APPRDET B1, COMPMAS C1 WHERE A1.APPRMASID = B1.APPRMASID AND TSNAME = 'Yarn Purchase Order'
        AND B1.APPUSER = :UNAM AND A1.ENAME = C1.COMPMASID AND S.APPTYPE=A1.APPTYPE AND C1.COMPANYID  = :EXPNAME ) 
        AND A.STATUS = 'Requested') ) A, (SELECT   B.COMPANYID ENAME, A.TSNAME, A.MAXLEVEL
        FROM   APPRMAS A, COMPMAS B WHERE   A.ENAME = B.COMPMASID) B WHERE   A.ENAME = B.ENAME(+) AND A.TNAME = B.TSNAME(+)
        ORDER BY SNAME, FINYEAR, DOCMAXNO`

        binds = {
            EXPNAME: data.ENAME,
            UNAM: data.UNAM

        }
        options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        let result = await connection.execute(sql, binds, options)
        if (result.rows.length > 0) {
            return res.status(200).send(JSON.stringify({
                STATUS: true,
                MESSAGE: "Success",
                data: result.rows
            }));
        } else {
            return res.status(200).json({
                STATUS: false,
                MESSAGE: "Faild",
                data: []
            });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json(
            {
                STATUS: false,
                error: err.message
            }
        );
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}

async function insertYarnPoApproval(data, res) {
    let connection;
    try {

        console.log("data => ", data)

        connection = await oracledb.getConnection(dbconfig);

        const records = data.selectedRecords;

        if (!records || records.length === 0) {
            return res.status(400).json({
                STATUS: false,
                MESSAGE: "No records selected"
            });
        }

        const insertHistoryApprovalSql = `INSERT INTO APPROVAL_HISTORY (SNAME, MASTERID, APPLEVEL, APPUSER, APPDATE, TRANSID, DOCID) 
        VALUES ( :SNAME , :ACCPOMASID , :APPLEV , :USERNAME , SYSDATE  , :TSID  , :DOCID )`;

        const insertHistoryApprovalBinds = records.map(y => ({
            SNAME: y.SNAME,
            ACCPOMASID: y.ACCPOMASID,
            APPLEV: y.APPLEV,
            USERNAME: data.username,
            TSID: y.TSIDNEW,
            DOCID: y.DOCID
        }));

        await connection.executeMany(insertHistoryApprovalSql, insertHistoryApprovalBinds);



        const updateApprovalBinds = records.map(y => ({
            USERNAME: data.username,
            DOCID: y.DOCID
        }));


        const insertVerifyApprovalSql = `UPDATE YARNPOMAS SET VERIFIEDBY = :USERNAME, VERIFIEDON= SYSDATE WHERE DOCID = :DOCID AND APPLEVEL=1 AND MAXLEVEL=3`;

        await connection.executeMany(insertVerifyApprovalSql, updateApprovalBinds);


        const insertForwardApprovalSql1 = `UPDATE YARNPOMAS SET FORWARDBY = :USERNAME, FORWARDON= SYSDATE WHERE DOCID = :DOCID AND APPLEVEL=2 AND MAXLEVEL=3`;

        await connection.executeMany(insertForwardApprovalSql1, updateApprovalBinds);


        const insertForwardApprovalSql2 = `UPDATE YARNPOMAS SET FORWARDBY = :USERNAME, FORWARDON = SYSDATE WHERE DOCID = :DOCID AND APPLEVEL=1 AND MAXLEVEL=2`;

        await connection.executeMany(insertForwardApprovalSql2, updateApprovalBinds);


        const insertStatusApprovalSql = `UPDATE YARNPOMAS SET STATUS='Approved',APPROVED='T', APPBY=:USERNAME, APPON= SYSDATE WHERE DOCID=:DOCID AND APPLEVEL = MAXLEVEL`;

        await connection.executeMany(insertStatusApprovalSql, updateApprovalBinds);



        // const mailSql = `INSERT INTO AXP_MAILJOBS (SELECT MAILJOB_SEQ.NEXTVAL,SYSDATE,MAILTO,MAILCC CC,
        // 'Yarn PO Approved - '||:DOCID || ' - '||C.PARTYID,'Dear All,'
        // ||CHR(13)||CHR(13)||'Yarn Po Approved For your Refernce'||CHR (13)|| CHR (13)||CHR (13)|| 
        // '**This is system generated mail, pls do not reply**','f__yporpnt','','',
        // 'YarnP',:RECORDID ,0,'','','' FROM YARNPOMAS A,(SELECT B.MAILTO,B.MAILCC,A.COMPMASID FROM 
        // COMPMAS A,COMPMAIL B WHERE A.COMPMASID=B.COMPMASID AND B.SCREEN='YARN PURCHASE ORDER') B,
        // PARTYMAS C WHERE APPLEVEL=MAXLEVEL AND YARNPOMASID= :RECORDID AND A.PARTYID=C.PARTYMASID 
        // AND A.ENAME=B.COMPMASID )`

        const mailSql = `INSERT INTO AXP_MAILJOBS (SELECT MAILJOB_SEQ.NEXTVAL,SYSDATE, 'vijayvelu.git@gmail.com',  
        NULL, 'Yarn PO Approved - ' || :DOCID || ' - ' || C.PARTYID,'Dear All,' || 
        CHR(13) || CHR(13) || 'Yarn Po Approved For your Refernce' ||CHR(13) || CHR(13) || CHR(13) ||
        '**This is system generated mail, pls do not reply**','f__yporpnt', '', '', 'YarnP', :RECORDID,
        0, '','', '' FROM YARNPOMAS A, PARTYMAS C WHERE APPLEVEL = MAXLEVEL AND YARNPOMASID = :RECORDID
        AND A.PARTYID = C.PARTYMASID)`;

        const mailBinds = records.map(r => ({
            DOCID: r.DOCID,
            RECORDID: r.RECORDID
        }));

        // console.log("mailBinds => ", mailBinds)

        await connection.executeMany(mailSql, mailBinds);



        // await connection.commit();

        console.log("All records processed successfully");

        return res.status(200).json({
            STATUS: true,
            MESSAGE: "Yarn Po Approved Successfully"
        });

    } catch (err) {
        console.error("Error", err);
        res.status(500).json({
            STATUS: false,
            MESSAGE: "Faild"
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}

// async function insertYarnPoReject(data, res) {
//     let connection, sql, binds, options
//     try {

//     } catch (err) {
//         console.error("Error", err);
//         res.status(500).json({
//             STATUS: false,
//             MESSAGE: "Faild"
//         });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error("Error closing connection:", err);
//             }
//         }
//     }
// }


module.exports = {
    getYarnPoApprovalSelect, insertYarnPoApproval
}
