var config = require('../config/config.js');
var mysql = require('mysql');

var pool = mysql.createPool({
    host: config.host,
    user: config.userName,
    password: config.userPassword,
    database: config.db,
    connectionLimit: 5
});

function query(incomingQuery, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            connection.query(incomingQuery, function (error, dbResponse) {
                var result = new Object();

                if (error) {
                    console.log(error);
                    result.error = error;
                    connection.release();
                    callback(result);
                } else {
                    result.succes = dbResponse;
                    connection.release();
                    callback(result);
                }
            });
        }
    });
}

module.exports = {
    query: query
};