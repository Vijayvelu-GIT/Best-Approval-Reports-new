const oracledb = require("oracledb");
const dbconfig = require("./dbconfig");

async function getYarnPoApproval(data, res) {
    let connection, sql, binds, options
    try {
        connection = await oracledb.getConnection(dbconfig);

        sql = `SELECT   A.*,  'Reject' REJECT, 'Multiple' APPTYPE, 'tYarnP' TSIDNEW,  ACCPOMASID RECORDID
        FROM (SELECT   A.YARNPOMASID ACCPOMASID,  EX.COMPANYID ENAME, A.DOCID, A.DOCDATE,
        'YARNPOMAS' TNAME, A.CREATEDBY, A.CREATEDON, B.PARTYID, 'Yarn Purchase Order' SNAME, A.TOTPOQTY, 
        A.APPLEVEL + 1 APPLEV,A.NET,A.DOCMAXNO, A.FINYEAR, A.REASON,MAXLEVEL  FROM   YARNPOMAS A,COMPMAS EX, 
        PARTYMAS B ,(SELECT YARNPOMASID,B.APPTYPE FROM YARNPODET A,FORDEMAS B WHERE A.ORDNOS=B.FORDEMASID AND 
        A.YARNPODETROW=1)S WHERE A.ENAME = EX.COMPMASID  AND EX.COMPANYID = :EXPNAME  AND A.PARTYID = B.PARTYMASID 
        AND A.REQUEST = 'T' AND A.YARNPOMASID=S.YARNPOMASID AND A.CANCEL = 'F' AND (APPLEVEL + 1 = (SELECT 
        DISTINCT APPLEVEL FROM   APPRMAS A1, APPRDET B1, COMPMAS C1 WHERE A1.APPRMASID = B1.APPRMASID AND TSNAME = 'Yarn Purchase Order'
        AND B1.APPUSER = :UNAM AND A1.ENAME = C1.COMPMASID AND S.APPTYPE=A1.APPTYPE AND C1.COMPANYID  = :EXPNAME ) 
        AND A.STATUS = 'Requested') ) A, (SELECT   B.COMPANYID ENAME, A.TSNAME, A.MAXLEVEL
        FROM   APPRMAS A, COMPMAS B WHERE   A.ENAME = B.COMPMASID) B WHERE   A.ENAME = B.ENAME(+) AND A.TNAME = B.TSNAME(+)
        ORDER BY   SNAME, FINYEAR, DOCMAXNO`

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


module.exports = {
    getYarnPoApproval
}
