var router = require('express').Router();
var squel = require('squel');
var dbservice = require('../services/mysql.js');
var config = require("../config/config.js");
var crypto = require('crypto');

//Midleware to test admin user
router.use('/', function (request, response, next) {
    console.log(request.decoded); //{ user: 'Testi2333', id: 60, iat: 1473702837 }
    next();
});

router.get('/', function (request, response) {
    var newQuery = squel.useFlavour(config.dialect).select()
            .from('users')
            .field('ID')
            .field('UserName')
            .field('LastName')
            .field('FirstName')
            .field('PictureUrl')
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
            data = {
                succes: dbResponse.succes
            };
            response.send(data);
        }
    });
});


router.get('/me', function (request, response) {
    var newQuery = squel.useFlavour(config.dialect).select()
            .from('users')
            .field('ID', 'id')
            .field('UserName')
            .field('LastName')
            .field('FirstName')
            .field('PictureUrl')
            .where("ID = ?", request.decoded.id)
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
            data = {
                succes: dbResponse.succes
            };
            response.send(data);
        }
    });
});
router.put('/me', function (request, response) {
    var incomingJson = '';

    request.on('data', function (data) {
        incomingJson += data;
    });

    request.on('end', function () {
        if (typeof incomingJson === "string") {
            incomingJson = JSON.parse(incomingJson);
        }
        console.log(incomingJson);
        //Testi parameter
        if ((!incomingJson.username) || (!incomingJson.userpassword)) {
            var data = {
                error: "Missing username or userpassword"
            };
            response.status(400);
            response.send(data);
        } else {
            var hash = crypto.createHmac('sha256', config.secret)
                    .update(incomingJson.userpassword)
                    .digest('hex');

            var newQuery = squel.useFlavour(config.dialect).update()
                    .table('users')
                    .set('username', incomingJson.username)
                    .set('userpassword', hash)
                    .set('lastname', incomingJson.lastname)
                    .set('firstname', incomingJson.firstname)
                    .where("ID = ?", request.decoded.id)
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
                    data = {
                        succes: dbResponse.succes
                    };
                    response.send(data);
                }
            });
        }
    });
});

//Midleware to test admin user
router.use('/', function (request, response, next) {
    if (request.decoded.id === 1) {
        next();
    } else {
        var data = {
            error: "Resource only available to admin"
        };
        response.status(403);
        response.send(data);
    }
});

router.delete('/:id', function (request, response) {
    var newQuery = squel.useFlavour(config.dialect).delete()
            .from('users')
            .where("id = ?", request.params.id)
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
            data = {
                succes: dbResponse.succes
            };
            response.send(data);
        }
    });
});

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
                    data = {
                        succes: dbResponse.succes
                    };
                    response.send(data);
                }
            });
        }
    });
});

router.put('/:id', function (request, response) {
    var incomingJson = '';

    request.on('data', function (data) {
        incomingJson += data;
    });

    request.on('end', function () {
        if (typeof incomingJson === "string") {
            incomingJson = JSON.parse(incomingJson);
        }
        console.log(incomingJson);
        //Testi parameter
        if ((!incomingJson.username) || (!incomingJson.userpassword)) {
            var data = {
                error: "Missing username or userpassword"
            };
            response.status(400);
            response.send(data);
        } else {
            var hash = crypto.createHmac('sha256', config.secret)
                    .update(incomingJson.userpassword)
                    .digest('hex');

            var newQuery = squel.useFlavour(config.dialect).update()
                    .table('users')
                    .set('username', incomingJson.username)
                    .set('userpassword', hash)
                    .where("id = ?", request.params.id)
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
                    data = {
                        succes: dbResponse.succes
                    };
                    response.send(data);
                }
            });
        }
    });
});

module.exports = router;