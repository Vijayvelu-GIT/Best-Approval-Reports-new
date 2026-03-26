const oracledb = require("oracledb");
const dbconfig = require("./dbconfig");


async function getSelectedCompany(data, res) {
    let connection, sql, binds, options
    try {
        connection = await oracledb.getConnection(dbconfig);

        sql = `select companyid from compmas`

        binds = {}
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
            return res.status(401).json({
                STATUS: false,
                MESSAGE: "Faild"
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


async function getFabricApproval(data, res) {
    let connection, sql, binds, options
    try {
        connection = await oracledb.getConnection(dbconfig);

        sql = `SELECT A.DOCID,A.DOCDATE,C.PARTYID,D.FABNAME,F.COLOR,B.SRATE RATE,A.APPROVED,A.APPLEVEL,B.FORDEDETID ,
        A.FORDEMASID ,A.APPLEVEL + 1 APPLEV,A.ORDVAL,A.BUDGVAL BUDVAL, A.ORDVAL-A.BUDGVAL  DIFF,A.PROFITMAR PRPER,
        B.ORDQTY,B.OLOSSPER,B.PRODQTY,A.APPTYPE FAPPTYPE FROM FORDEMAS A,FORDEDET B,PARTYMAS C,FABMAS D,COLORMAS F 
        WHERE A.FORDEMASID=B.FORDEMASID AND A.PARTYID=C.PARTYMASID AND B.FABNAME=D.FABMASID(+)  AND 
        B.COLOR=F.COLORMASID AND A.REQUEST='T' AND A.APPROVED='F' AND (A.APPLEVEL + 1 = (SELECT DISTINCT B1.APPLEVEL 
        FROM   APPRMAS A1, APPRDET B1,COMPMAS C1 WHERE   A1.APPRMASID = B1.APPRMASID AND A1.ENAME=C1.COMPMASID 
        AND C1.COMPANYID=:ENAME  AND TSNAME = 'Fabric Order Entry.'  AND B1.APPUSER = :UNAM AND A.APPTYPE=A1.APPTYPE ))ORDER BY 1`

        binds = {
            ENAME: data.ENAME,
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
            return res.status(401).json({
                STATUS: false,
                MESSAGE: "Faild"
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


async function insertFabricApproval(data, res) {
    let connection;

    try {

        // console.log("data => ", data)

        connection = await oracledb.getConnection(dbconfig);

        const records = data.selectedRecords;

        if (!records || records.length === 0) {
            return res.status(400).json({
                STATUS: false,
                MESSAGE: "No records selected"
            });
        }


        const updateAppLevelSql = `UPDATE FORDEMAS SET APPLEVEL= :APPLEV WHERE FORDEMASID = :FORDEMASID`;

        const updateAppLevelBinds = records.map(r => ({
            APPLEV: r.APPLEV,
            FORDEMASID: r.FORDEMASID
        }));

        await connection.executeMany(updateAppLevelSql, updateAppLevelBinds);




        const insertHistorySql = `
            insert into approval_history (SNAME,MASTERID,APPLEVEL,APPUSER,APPDATE,TRANSID,DOCID) values 
            ( 'Fabric Order Entry.' , :fordemasid , :applev , :username , SYSDATE  , 'forde'  , :docid )`;

        const insertHistoryBinds = records.map(r => ({
            fordemasid: r.FORDEMASID,
            applev: r.APPLEV,
            username: data.username,
            docid: r.DOCID
        }));

        await connection.executeMany(insertHistorySql, insertHistoryBinds);




        const verifySql = `update fordemas set verifyby=:username,verifyon= sysdate where docid=:docid and applevel=1 and maxlevel=3`;

        const verifyBinds = records.map(r => ({
            username: data.username,
            docid: r.DOCID
        }));

        await connection.executeMany(verifySql, verifyBinds);




        const forwardSql1 = `update fordemas set forwardby=:username,forwardon= sysdate where docid=:docid and applevel=2 and maxlevel=3`;

        await connection.executeMany(forwardSql1, verifyBinds);




        const forwardSql2 = `update fordemas set forwardby=:username,forwardon= sysdate where docid=:docid and applevel=1 and maxlevel=2`;

        await connection.executeMany(forwardSql2, verifyBinds);




        const finalApproveSql = `update fordemas set fstatus='Approved',approved='T',apprby=:username,appron= sysdate where docid=:docid and applevel = maxlevel`;

        await connection.executeMany(finalApproveSql, verifyBinds);




        const mailSql = `INSERT INTO AXP_MAILJOBS ( SELECT MAILJOB_SEQ.NEXTVAL, SYSDATE,MAILTO,MAILCC CC,'Fabric Order Approved - '||:DOCID ||C.PARTYID,'Dear All,
        '||CHR(13)||CHR(13)||'Fabric Order Approved For your Refernce'||CHR (13)|| CHR (13)||CHR (13)||  '**This is system generated mail, pls do not reply**','','','',
        'forde',:FORDEMASID ,0,'','','' FROM fordemas A,(select B.MAILTO,B.MAILCC,A.compmasID from compmas a,compmail b where a.compmasid=b.compmasid and 
        B.SCREEN='FABRIC ORDER ENTRY'  and b.ordtype=:FAPPTYPE) B,PARTYMAS C WHERE APPLEVEL=MAXLEVEL AND  fordemasid= :FORDEMASID AND A.PARTYID=C.PARTYMASID 
        AND A.ENAME=B.COMPMASID )`;

        // const mailSql = `INSERT INTO AXP_MAILJOBS (SELECT MAILJOB_SEQ.NEXTVAL, SYSDATE, B.MAILTO, B.MAILCC,'Fabric Order Approved - ' || :DOCID || C.PARTYID,
        // 'Dear All,' || CHR(13) || CHR(13) || 'Fabric Order Approved For your Reference' || CHR(13) || CHR(13) || CHR(13) ||
        // '**This is system generated mail, pls do not reply**', '', '', '','forde', A.FORDEMASID, 0, '', '', ''  FROM 
        // (SELECT DISTINCT FORDEMASID, PARTYID, ENAME FROM FORDEMAS WHERE APPLEVEL = MAXLEVEL AND FORDEMASID = :FORDEMASID) A,
        // (SELECT B.MAILTO, B.MAILCC, A.COMPMASID FROM COMPMAS A, COMPMAIL B WHERE A.COMPMASID = B.COMPMASID AND 
        // B.SCREEN = 'FABRIC ORDER ENTRY' AND B.ORDTYPE = :FAPPTYPE) B,PARTYMAS C WHERE A.PARTYID = C.PARTYMASID AND A.ENAME = B.COMPMASID)`


        // const mailSql = `INSERT INTO AXP_MAILJOBS SELECT  MAILJOB_SEQ.NEXTVAL,   SYSDATE,
        // 'vijayvelu.git@gmail.com',  NULL, 'Fabric Order Approved - ' || :DOCID || ' - ' || C.PARTYID,
        // 'Dear All,' || CHR(13) || CHR(13) || 'Fabric Order Approved For your Reference' ||
        // CHR(13) || CHR(13) || CHR(13) ||  '**This is system generated mail, pls do not reply**',
        // '', '', '','forde', :FORDEMASID,  0, '', '', '' FROM FORDEMAS A JOIN PARTYMAS C ON 
        // A.PARTYID = C.PARTYMASID  WHERE APPLEVEL = MAXLEVEL AND FORDEMASID = :FORDEMASID`;

        const mailBinds = records.map(r => ({
            DOCID: r.DOCID,
            FORDEMASID: r.FORDEMASID,
            FAPPTYPE: r.FAPPTYPE
        }));

        // console.log("mailBinds => ", mailBinds)

        await connection.executeMany(mailSql, mailBinds);



        await connection.commit();


        console.log("All records processed successfully");

        return res.status(200).json({
            STATUS: true,
            MESSAGE: "Fabric Orders Approved Successfully"
        });

    } catch (err) {

        if (connection) await connection.rollback();

        console.error("Error:", err);

        return res.status(500).json({
            STATUS: false,
            MESSAGE: err.message
        });

    } finally {

        if (connection) await connection.close();
    }
}



async function rejectFabricApproval(data, res) {
    let connection;

    try {

        connection = await oracledb.getConnection(dbconfig);

        const records = data.selectedRecords;

        // console.log("data => ", data)

        if (!records || records.length === 0) {
            return res.status(400).json({
                STATUS: false,
                MESSAGE: "No records selected"
            });
        }


        const rejUpdateSql5 = `update fordemas set fstatus='Rejected', approved = 'F', applevel = 0, apprby = null, appron = null,
        rej='T', request = 'F', rejby= :USERNAME, rejon=sysdate where docid=:DOCID`

        const binds5 = records.map(r => ({
            USERNAME: data.username,
            DOCID: r.DOCID
        }));

        const result5 = await connection.executeMany(rejUpdateSql5, binds5);

        // console.log("result5 => ", result5.rowsAffected)

        const totalAffected = result5.rowsAffected;

        if (!totalAffected || totalAffected === 0) {
            await connection.rollback();
            return res.status(400).json({
                STATUS: false,
                MESSAGE: "No records found to reject"
            });
        }

        // console.log("checking 1")

        // const rejectSql = `
        //     UPDATE fordemas
        //     SET fstatus = 'Rejected',
        //         approved = 'F',
        //         applevel = 0,
        //         apprby = NULL,
        //         appron = NULL,
        //         rej = 'T',
        //         request = 'F',
        //         rejby = :username,
        //         rejon = SYSDATE
        //     WHERE docid = :docid
        // `;

        // const rejectBinds = records.map(r => ({
        //     username: data.username,
        //     docid: r.DOCID
        // }));

        // const result = await connection.executeMany(rejectSql, rejectBinds);


        // const mailSql = `INSERT INTO AXP_MAILJOBS ( SELECT MAILJOB_SEQ.NEXTVAL, SYSDATE,MAILTO,MAILCC CC,'Fabric Order Rejected - '||:DOCID 
        // ||C.PARTYID,'Dear All,'||CHR(13)||CHR(13)|| 'Fabric Order Rejected For your Refernce'||CHR (13)|| CHR (13)||'Remarks ** '|| :REASON 
        // ||CHR (13)||  '**This is system generated mail, pls do not reply**','','','','forde', :FORDEMASID ,0,'','','' FROM 

        // fordemas A,(select B.MAILTO,B.MAILCC,A.compmasID from compmas a,compmail b where a.compmasid=b.compmasid and 
        // B.SCREEN='FABRIC ORDER ENTRY' and b.ordtype = :FAPPTYPE) B,PARTYMAS C WHERE a.docid= :DOCID 
        // AND A.PARTYID = C.PARTYMASID AND A.ENAME=B.COMPMASID)`;


        const mailSql = `INSERT INTO AXP_MAILJOBS (SELECT MAILJOB_SEQ.NEXTVAL, SYSDATE, B.MAILTO, B.MAILCC, 'Fabric Order Rejected - ' || :DOCID || C.PARTYID,        
        'Dear All,' || CHR(13) || CHR(13) || 'Fabric Order Rejected For your Reference' || CHR(13) || CHR(13) || 'Remarks ** ' || :REASON || 
        CHR(13) || '**This is system generated mail, pls do not reply**', '', '', '', 'forde', A.FORDEMASID, 0,'','', ''        
        FROM
        (SELECT DISTINCT FORDEMASID, PARTYID, ENAME, DOCID FROM FORDEMAS WHERE DOCID = :DOCID) A,(SELECT B.MAILTO, B.MAILCC, A.COMPMASID
        FROM COMPMAS A, COMPMAIL B WHERE A.COMPMASID = B.COMPMASID AND B.SCREEN = 'FABRIC ORDER ENTRY' AND B.ORDTYPE = :FAPPTYPE) B, PARTYMAS C
        WHERE A.PARTYID = C.PARTYMASID AND A.ENAME = B.COMPMASID)`

        const mailBinds = records.map(r => ({
            DOCID: r.DOCID,
            REASON: data.reason,
            FORDEMASID: r.FORDEMASID,
            FAPPTYPE: r.FAPPTYPE
        }));


        await connection.executeMany(mailSql, mailBinds);

        await connection.commit();

        return res.status(200).json({
            STATUS: true,
            MESSAGE: "Fabric Orders Rejected Successfully"
        });

    } catch (err) {

        if (connection) await connection.rollback();

        console.error("Error:", err);

        return res.status(500).json({
            STATUS: false,
            MESSAGE: err.message
        });

    } finally {

        if (connection) await connection.close();

    }
}





module.exports = {
    getFabricApproval, insertFabricApproval, rejectFabricApproval, getSelectedCompany
}