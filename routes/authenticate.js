var router = require('express').Router();
var jwt = require('jsonwebtoken');
var squel = require('squel');
var dbservice = require('../services/mysql.js');
var config = require("../config/config.js");
var crypto = require('crypto');

router.post('/', function (request, response) {
    var incomingJson = '';

    request.on('data', function (data) {
        incomingJson += data;
    });

    request.on('end', function () {
        console.log("Following json was received: " + incomingJson);

        if (typeof incomingJson === "string") {
            incomingJson = JSON.parse(incomingJson);
        }

        //Testi parameter
        if (!incomingJson.username || !incomingJson.userpassword) {
            var data = {
                error: "Missing username or userpassword"
            };
            response.status(400);
            response.send(data);
        } else {
            var newQuery = squel.useFlavour(config.dialect).select()
                    .from('users')
                    .where("username = ?", incomingJson.username)
                    .toString();
            console.log(newQuery);
            dbservice.query(newQuery, function (dbResponse) {
                console.log(dbResponse);
                var data;
                if (dbResponse.error) {
                    data = {
                        error: dbResponse.error
                    };
                    response.status(404);
                    response.send(data);
                } else {
                    console.log(dbResponse);
                    var hash = crypto.createHmac('sha256', config.secret)
                            .update(incomingJson.userpassword)
                            .digest('hex');
                    if ((dbResponse.succes.length !== 0) && (dbResponse.succes[0].UserPassword === hash)) {
                        var token = jwt.sign({user: dbResponse.succes[0].UserName, id: dbResponse.succes[0].ID}, config.signKey);
                        data = {
                            Accestoken: token
                        };
                        response.send(data);
                    } else {
                        data = {
                            error: "Wrong username or password"
                        };
                        response.status(403);
                        response.send(data);
                    }
                }
            });
        }
    });
});

module.exports = router;