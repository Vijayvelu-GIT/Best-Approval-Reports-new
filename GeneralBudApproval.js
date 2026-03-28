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

    console.log("result => ", result)

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
        (await connection).close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};



module.exports = {
  getGeneralBudApproval
}