var router = require('express').Router();
var squel = require('squel');
var dbservice = require('../services/mysql.js');
var config = require("../config/config.js");
var crypto = require('crypto');

//Midleware to test admin user
router.use('/', function (request, response, next) {
    next();
    console.log(request.decoded); //{ user: 'Testi2333', id: 60, iat: 1473702837 }
    /*if (request.decoded.user === "Ville") {
     next();
     } else {
     var data = {
     error: "Resource only available to admin"
     };
     response.status(403);
     response.send(data);
     }*/
});


module.exports = router;
