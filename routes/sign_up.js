var router = require('express').Router();
var squel = require('squel');
var dbservice = require('../services/mysql.js');
var config = require("../config/config.js");
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

router.post('/', function (request, response) {
    var incomingJson = '';

    request.on('data', function (data) {
        incomingJson += data;
    });

    request.on('end', function () {
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
            var hash = crypto.createHmac('sha256', config.secret)
                    .update(incomingJson.userpassword)
                    .digest('hex');

            var newQuery = squel.useFlavour(config.dialect).insert()
                    .into('users')
                    .set('username', incomingJson.username)
                    .set('userpassword', hash)
                    .set('lastname', incomingJson.lastname)
                    .set('firstname', incomingJson.firstname)
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
                    var token = jwt.sign({user: incomingJson.username, id: dbResponse.succes.insertId}, config.signKey);
                    data = {
                        Accestoken: token
                    };
                    response.send(data);
                }
            });
        }
    });
});

module.exports = router;