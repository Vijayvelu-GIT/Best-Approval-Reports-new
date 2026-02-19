const oracledb = require("oracledb");
const dbconfig = require("./dbconfig");
const crypto = require("crypto");

async function getSelectedCompany(data, res) {
    let connection, sql, binds, options
    try {
        connection = await oracledb.getConnection(dbconfig);

        sql = `select companyid from compmas`

        binds = {  }
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

        sql = `SELECT A.DOCID,A.DOCDATE,C.PARTYID,D.fabname,F.COLOR,B.srate RATE,A.approved,A.APPLEVEL,B.fordedetid ,a.fordemasid ,A.APPLEVEL + 1 applev,
a.ordval,a.budgval budval, a.ordval-a.budgval  diff,a.profitmar prper,b.ordqty,b.olossper,b.prodqty
FROM fordemas A,fordedet B,PARTYMAS C,fabmas D,COLORMAS F
WHERE A.fordemasid=B.fordemasid AND A.PARTYID=C.PARTYMASID AND B.fabname=D.fabmasid(+)  AND B.COLOR=F.COLORMASID 
and a.request='T'
and a.approved='F'
             AND (a.APPLEVEL + 1 =
             (SELECT   DISTINCT b1.APPLEVEL
                FROM   APPRMAS A1, APPRDET B1,compmas c1
                WHERE   A1.APPRMASID = B1.APPRMASID
                and a1.ename=c1.compmasid and c1.companyid=:ename
                AND TSNAME = 'Fabric Order Entry.'
                AND B1.APPUSER = :UNAM and a.apptype=a1.apptype) )order by 1`

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
        connection = await oracledb.getConnection(dbconfig);

        const records = data.selectedRecords;

        if (!records || records.length === 0) {
            return res.status(400).json({
                STATUS: false,
                MESSAGE: "No records selected"
            });
        }


        const mailSql = `
            INSERT INTO AXP_MAILJOBS
            SELECT MAILJOB_SEQ.NEXTVAL,
                   SYSDATE,
                   MAILTO,MAILCC CC,
                   'Fabric Order Approved - '||:docid||C.PARTYID,
                   'Dear All,'||CHR(13)||CHR(13)||
                   'Fabric Order Approved For your Reference'||
                   CHR(13)||CHR(13)||CHR(13)||
                   '**This is system generated mail, pls do not reply**',
                   '','','','forde',:fordemasid,0,'','',''
            FROM fordemas A,
                 (SELECT B.MAILTO,B.MAILCC,A.compmasID
                  FROM compmas A, compmail B
                  WHERE A.compmasid=B.compmasid
                  AND B.SCREEN='FABRIC ORDER ENTRY') B,
                 PARTYMAS C
            WHERE APPLEVEL = MAXLEVEL
            AND fordemasid = :fordemasid
            AND A.PARTYID = C.PARTYMASID
            AND A.ENAME = B.COMPMASID
        `;

        const mailBinds = records.map(r => ({
            docid: r.DOCID,
            fordemasid: r.FORDEMASID
        }));

        await connection.executeMany(mailSql, mailBinds);


        const updateAppLevelSql = `
            UPDATE fordemas
            SET APPLEVEL = :applev
            WHERE fordemasid = :fordemasid
        `;

        const updateAppLevelBinds = records.map(r => ({
            applev: r.APPLEV,
            fordemasid: r.FORDEMASID
        }));        

        await connection.executeMany(updateAppLevelSql, updateAppLevelBinds);



        const insertHistorySql = `
            INSERT INTO approval_history
            (SNAME, MASTERID, APPLEVEL, APPUSER, APPDATE, TRANSID, DOCID)
            VALUES
            ('Fabric Order Entry.',
             :fordemasid,
             :applev,
             :username,
             SYSDATE,
             'forde',
             :docid)
        `;

        const insertHistoryBinds = records.map(r => ({
            fordemasid: r.FORDEMASID,
            applev: r.APPLEV,
            username: data.username,
            docid: r.DOCID
        }));

        await connection.executeMany(insertHistorySql, insertHistoryBinds);



        const verifySql = `
            UPDATE fordemas
            SET verifyby = :username,
                verifyon = SYSDATE
            WHERE docid = :docid
            AND applevel = 1
            AND maxlevel = 3
        `;

        const verifyBinds = records.map(r => ({
            username: data.username,
            docid: r.DOCID
        }));

        await connection.executeMany(verifySql, verifyBinds);


        const forwardSql1 = `
            UPDATE fordemas
            SET forwardby = :username,
                forwardon = SYSDATE
            WHERE docid = :docid
            AND applevel = 2
            AND maxlevel = 3
        `;

        await connection.executeMany(forwardSql1, verifyBinds);


        const forwardSql2 = `
            UPDATE fordemas
            SET forwardby = :username,
                forwardon = SYSDATE
            WHERE docid = :docid
            AND applevel = 1
            AND maxlevel = 2
        `;

        await connection.executeMany(forwardSql2, verifyBinds);


        const finalApproveSql = `
            UPDATE fordemas
            SET fstatus = 'Approved',
                approved = 'T',
                apprby = :username,
                appron = SYSDATE
            WHERE docid = :docid
            AND applevel = maxlevel
        `;

        await connection.executeMany(finalApproveSql, verifyBinds);

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

        if (!records || records.length === 0) {
            return res.status(400).json({
                STATUS: false,
                MESSAGE: "No records selected"
            });
        }

        const mailSql = `
            INSERT INTO AXP_MAILJOBS
            SELECT MAILJOB_SEQ.NEXTVAL,
                   SYSDATE,
                   MAILTO,
                   MAILCC,
                   'Fabric Order Rejected - '||:docid||C.PARTYID,
                   'Dear All,'||CHR(13)||CHR(13)||
                   'Fabric Order Rejected For your Reference'||
                   CHR(13)||CHR(13)||
                   'Remarks ** '||:updmessage||CHR(13)||
                   '**This is system generated mail, pls do not reply**',
                   '','','','forde',:fordemasid,0,'','',''
            FROM fordemas A,
                 (SELECT B.MAILTO,B.MAILCC,A.compmasID
                  FROM compmas A, compmail B
                  WHERE A.compmasid=B.compmasid
                  AND B.SCREEN='FABRIC ORDER ENTRY') B,
                 PARTYMAS C
            WHERE A.docid = :docid
            AND A.PARTYID = C.PARTYMASID
            AND A.ENAME = B.COMPMASID
        `;

        const mailBinds = records.map(r => ({
            docid: r.DOCID,
            updmessage: data.updmessage,
            fordemasid: r.FORDEMASID
        }));

        await connection.executeMany(mailSql, mailBinds);

        const rejectSql = `
            UPDATE fordemas
            SET fstatus = 'Rejected',
                approved = 'F',
                applevel = 0,
                apprby = NULL,
                appron = NULL,
                rej = 'T',
                request = 'F',
                rejby = :username,
                rejon = SYSDATE
            WHERE docid = :docid
        `;

        const rejectBinds = records.map(r => ({
            username: data.username,
            docid: r.DOCID
        }));

        const result = await connection.executeMany(rejectSql, rejectBinds);

        const totalAffected = result.rowsAffected;

        if (!totalAffected || totalAffected === 0) {
            await connection.rollback();
            return res.status(400).json({
                STATUS: false,
                MESSAGE: "No records found to reject"
            });
        }


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
    getFabricApproval, insertFabricApproval, rejectFabricApproval,getSelectedCompany
}