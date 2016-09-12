var jwt = require('jsonwebtoken');
var config = require('../config/config.js');

var publicRoutes = [
    "authenticate",
    "sign_up"
];

var protectedRoutes = [
    "users",
    "rooms"
];

module.exports = function (app) {
    publicRoutes.forEach(function (route) {
        app.use('/' + route, require(__dirname + '/' + route));
    });

    app.use(function (request, response, next) {
        var accesToken = request.headers['accestoken'];

        if (accesToken) {
            jwt.verify(accesToken, config.signKey, function (error, decoded) {
                if (error) {
                    response.status(401);
                    response.end("Wrong token");
                } else {
                    request.decoded = decoded;
                    next();
                }
            });
        } else {
            response.status(403);
            response.end("No token");
        }
    });

    protectedRoutes.forEach(function (route) {
        app.use('/' + route, require(__dirname + '/' + route));
    });
};


