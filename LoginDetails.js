const oracledb = require("oracledb");
const dbconfig = require("./dbconfig");
// const crypto = require("crypto");

// function md5Hash(text) {
//   return crypto.createHash("md5").update(text).digest("hex");
// }

async function login(data, res) {
    let connection, sql, binds, options
    try {
        // console.log("data => ", data );
        const hashedPassword = data.password;
        // console.log("hashedPassword => ",hashedPassword)

        connection = await oracledb.getConnection(dbconfig);

        sql = `SELECT * FROM AXUSERS WHERE USERNAME = :USERNAME AND PASSWORD = :PASSWORD`

        binds = {
            USERNAME: data.username,
            PASSWORD: hashedPassword
        }
        options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
        };

        let result = await connection.execute(sql, binds, options)

        // console.log("result => ", result.rows.length)

        if (result.rows.length > 0) {
            return res.status(200).json({
                STATUS : true,
                MESSAGE : "Login Successfully"
            });
        } else {
            return res.status(401).json({
                STATUS : false,
                MESSAGE : "Invalid Username or Password"
            });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json(
            {
                STATUS : false,
                error : err.message
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
    login
}