const oracledb = require("oracledb");
const dbconfig = require("./dbconfig");

async function getGeneralBudApproval(data, res) {
  let connection;

  try {

    console.log("data => ", data)

    connection = await oracledb.getConnection(dbconfig);

    sql = `SELECT   A.*,'Single' APPTYPE,NVL (MAXLEVEL, 0) MAXLEVEL FROM   (SELECT   A.GENPOMASID,
    EX.COMPANYID ENAME,A.DOCID,A.DOCDATE,'GENPOMAS' TNAME,A.CREATEDBY,C.PARTYID,'Purchase Order.' 
    SNAME,'t'||A.TSID TRANSID,A.TOTQTY,A.APPLEVEL + 1 APPLEV,A.NET,D.TRIMNAME, A.DOCMAXNO, A.FINYEAR,
    AXPATTACHMENTPATH || 'genpo' || A.GENPOMASID || '.pdf'POATT,A.REMARKS, A.POAGT,A.BUDTYPE,A.POPDF1 
    FROM GENPOMAS A,COMPMAS EX,PARTYMAS C,( SELECT   X.GENPOMASID, WM_CONCAT ( DISTINCT Y.ITEM || '  RATE :-  ' 
    || X.RATE) TRIMNAME FROM   GENPODET X, ITEMMASTER Y WHERE   X.ITEMNAME = Y.ITEMMASTERID AND X.GENPOMASID NOT 
    IN(10306000000653, 11099000000431)GROUP BY   X.GENPOMASID 
    UNION
    SELECT   X.GENPOMASID, '---' FROM   GENPODET X WHERE   X.GENPOMASID IN (10306000000653, 11099000000431) 
    GROUP BY   X.GENPOMASID) D,(SELECT   DISTINCT APPLEVEL,C.COMPANYID FROM   APPRMAS A, APPRDET B, COMPMAS C 
    WHERE A.APPRMASID = B.APPRMASID AND TSNAME = 'Purchase Order New.' AND B.APPUSER = :UNAM  AND A.ENAME = C.COMPMASID) E , 
    (SELECT   DISTINCT APPLEVEL FROM   APPRMAS A, APPRDET B, COMPMAS C WHERE A.APPRMASID = B.APPRMASID AND 
    TSNAME = 'Purchase Order New.' AND B.APPUSER = :UNAM AND A.ENAME = C.COMPMASID) F WHERE A.COMP = EX.COMPMASID 
    AND A.CANCEL = 'F' AND A.PARTYID = C.PARTYMASID AND A.GENPOMASID = D.GENPOMASID  AND A.REQUEST = 'T' AND 
    EX.COMPANYID=E.COMPANYID AND EX.COMPANYID=E.COMPANYID AND ((A.APPLEVEL + 1 =F.APPLEVEL AND A.STATUS = 'Requested') OR 
    (A.STATUS = 'Rejected'  AND A.APPLEVEL =F.APPLEVEL) )) A, (SELECT   B.COMPANYID ENAME, A.TSNAME, A.MAXLEVEL FROM 
    APPRMAS A, COMPMAS B WHERE   A.ENAME = B.COMPMASID AND TSNAME = 'Purchase Order New.') B
    WHERE A.ENAME=B.ENAME ORDER BY   A.ENAME, FINYEAR, DOCMAXNO`

    binds = {
      UNAM: data.UNAM
    }

    options = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    };

    let result = await connection.execute(sql, binds, options)

    console.log("result => ", result.rows)

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

    console.log("Error : ", err)

    return res.send(500).json({
      STATUS: false,
      error: err.message
    })

  } finally {

    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};



async function insertGeneralApproval(data, res) {
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


    const insertMasApprovalSql = `UPDATE GENPOMAS SET APPLEVEL = APPLEVEL + 1 WHERE GENPOMASID = :GENPOMASID `;

    const insertMasApprovalBinds = records.map(y => ({
      GENPOMASID: ""
    }));

    await connection.executeMany(insertMasApprovalSql, insertMasApprovalBinds);



    const insertHistoryApprovalSql = `INSERT INTO APPROVAL_HISTORY (SNAME, MASTERID, APPLEVEL, APPUSER, APPDATE, TRANSID, DOCID) VALUES 
        ( :SNAME , :ACCPOMASID , :APPLEV , :USERNAME , SYSDATE  , :TRANSID  , :DOCID )`;

    const insertHistoryApprovalBinds = records.map(y => ({
      SNAME: y.SNAME,
      ACCPOMASID: y.ACCPOMASID,
      APPLEV: y.APPLEV,
      USERNAME: data.username,
      TRANSID: y.TSIDNEW,
      DOCID: y.DOCID
    }));

    await connection.executeMany(insertHistoryApprovalSql, insertHistoryApprovalBinds);



    const updateApprovalBinds = records.map(y => ({
      USERNAME: data.username,
      DOCID: y.DOCID
    }));


    const insertVerifyApprovalSql = `UPDATE GENPOMAS SET VERIFIEDBY =:USERNAME, VERIFIEDON= SYSDATE WHERE DOCID=:DOCID AND APPLEVEL=1 AND MAXLEVEL=3`;

    await connection.executeMany(insertVerifyApprovalSql, updateApprovalBinds);


    const insertForwardApprovalSql1 = `UPDATE GENPOMAS SET FORWARDBY=:USERNAME, FORWARDON= SYSDATE WHERE DOCID=:DOCID AND APPLEVEL=2 AND MAXLEVEL=3`;

    await connection.executeMany(insertForwardApprovalSql1, updateApprovalBinds);


    const insertForwardApprovalSql2 = `UPDATE GENPOMAS SET FORWARDBY=:USERNAME,FORWARDON= SYSDATE WHERE DOCID=:DOCID AND APPLEVEL=1 AND MAXLEVEL=2`;

    await connection.executeMany(insertForwardApprovalSql2, updateApprovalBinds);



    const insertApprovalStsSql1 = `UPDATE GENPOMAS SET STATUS='Approved',APPROVED='T', APPRBY=:USERNAME, APPRON= SYSDATE WHERE DOCID=:DOCID AND APPLEVEL=3 AND MAXLEVEL=3`;

    await connection.executeMany(insertApprovalStsSql1, updateApprovalBinds);


    const insertApprovalStsSql2 = `UPDATE GENPOMAS SET STATUS='Approved',APPROVED='T', APPRBY=:USERNAME, APPRON= SYSDATE WHERE DOCID=:DOCID AND APPLEVEL=2 AND MAXLEVEL=2`;

    await connection.executeMany(insertApprovalStsSql2, updateApprovalBinds);


    const insertApprovalStsSql3 = `UPDATE GENPOMAS SET STATUS='Approved',APPROVED='T', APPRBY=:USERNAME, APPRON= SYSDATE WHERE DOCID=:DOCID AND APPLEVEL=1 AND MAXLEVEL=1`;

    await connection.executeMany(insertApprovalStsSql3, updateApprovalBinds);


    // const mailSql = `INSERT INTO AXP_MAILJOBS (SELECT MAILJOB_SEQ.NEXTVAL,SYSDATE,MAILTO,MAILCC CC,'General PO Approved - '||
    // :DOCID ||C.PARTYID,'Dear All,'||CHR(13)||CHR(13)||'General Po Approved For your Refernce'||CHR (13)|| 
    // CHR (13)||CHR (13)||  '**This is system generated mail, pls do not reply**','f__genpodos','','','genpo',
    // :GENPOMASID ,0,'','','' FROM GENPOMAS A,(SELECT B.MAILTO,B.MAILCC,A.COMPMASID FROM COMPMAS A,COMPMAIL B 
    // WHERE A.COMPMASID=B.COMPMASID AND B.SCREEN='GENERAL PURCHASE ORDER') B,PARTYMAS C WHERE APPLEVEL=MAXLEVEL 
    // AND A.MAILSENT=0 AND GENPOMASID= :GENPOMASID AND A.PARTYID=C.PARTYMASID AND A.ENAME=B.COMPMASID )`

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



    const mailStsSql = `UPDATE GENPOMAS SET MAILSENT=1 WHERE GENPOMASID=:GENPOMASID AND APPLEVEL = MAXLEVEL`

    const mailStsBinds = records.map(r => ({      
      GENPOMASID: r.GENPOMASID
    }));

    await connection.executeMany(mailStsSql, mailStsBinds);




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




module.exports = {
  getGeneralBudApproval, insertGeneralApproval
}