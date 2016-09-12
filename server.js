/*
 * Smygmis_web_server 2016
 * �Ville Hernesniemi
 * Made with node.js, mysql, fs, express
 * 
 * Use Accestoken as a header the following way:
 * {Accestoken : "30535045103169976"}
 *
 * Aquire valid Accestoken for a session from /log_in
 *
 * /log_in and /create_user dont need the header. All other
 * api requests will be blocked without proper header.
 */

var https = require('https');
var express = require('express');
var app = express();

var fs = require('fs');
var cert = {
    key: fs.readFileSync("cert/key.pem"),
    cert: fs.readFileSync("cert/cert.pem")
};

var mysql = require('mysql');
var config = require("./config/config.js");
var router = express.Router();

/*
 * Static files the server is suplying. Website goes here :)
 */
app.use(express.static(__dirname + '/public_html'));

/*
 *  api endpoints start here.
 *  
 *  current list of endpoints:
 *     /me
 *     /create_user
 *     /log_in
 *     /getListOfOtherUsers
 *     /getListOfMyGames
 *     /createGameRoom
 *     /getListOfGamesToJoin
 *     /joinGame 
 *     /getListRoomsWereAdmin 
 *     /updateScore
 *     
 *  to do list
 *     /addPlayerToRoom       
 *     games with more that 2 payers
 *     tournaments
 *     leagues
 *     email notifications
 *     profile picture  !!Support for url is in mysql    
 */

/*
 * api endpoint /getListRoomsWereAdmin
 * get a list of rooms were you are admin.
 * tests if request has a valid token and
 * matches user based on token.
 * 
 * Expexted header type: {Accestoken : "30535045103169976"}
 * 
 * Expected json output:
 * {"response":{
 *     "message":"SUCCESS",
 *     "data":[
 *         {
 *             "Room_ID":1,
 *             "Title":"Taskubilis",
 *             "StartingDate":null,
 *             "EndingDate":null,
 *             "PrivateGame":0,
 *             "AdminUserID":1,
 *             "AdminUserName":null,
 *             "Score":"2-1",
 *             "Player1":26,
 *             "Player1UserName":"pouko",
 *             "Player2":25,
 *             "Player2UserName":"kallejoo"
 *         },
 *     ],
 *     "info":{
 *         "date":"example_date",
 *         "endpoint":"/getListRoomsWereAdmin"
 *     }
 * }}
 */
app.get('/getListRoomsWereAdmin', function (request, response) {
    var accesToken = request.headers['accestoken'];
    logInfo('/getListRoomsWereAdmin received with Accestoken' + accesToken);

    if (isTokenLegid(accesToken)) {
        var userID = selectIDBasedOnToken(accesToken);

        connection.query("select * from 2_player_rooms where AdminUserID=" + userID + ";", function (error, dbResponse) {
            //Handle error
            if (error) {
                logInfo(error);
                var errorResponse = {
                    response: {
                        message: "ERROR",
                        data: "GENERIC_ERROR",
                        info: {
                            date: "example_date",
                            endpoint: "/getListRoomsWereAdmin"
                        }
                    }
                };
                response.end(JSON.stringify(errorResponse));
            }
            //query ok
            var successResponse = {
                response: {
                    message: "SUCCESS",
                    data: dbResponse,
                    info: {
                        date: "example_date",
                        endpoint: "/getListRoomsWereAdmin"
                    }
                }
            };
            response.end(JSON.stringify(successResponse));
        });
    } else {
        var errorResponse = {
            response: {
                message: "ERROR",
                data: "TOKEN_NOT_VALID",
                info: {
                    date: "example_date",
                    endpoint: "/getListRoomsWereAdmin"
                }
            }
        };
        response.end(JSON.stringify(errorResponse));
    }
});

/*
 * api endpoint /getListOfOtherUsers
 * get a list of other user.
 * tests if request has a valid token and
 * matches user based on token.
 * 
 * Expexted header type: {Accestoken : "30535045103169976"}
 * 
 * Expected json output:
 * {"response":{
 *     "message":"SUCCESS",
 *     "data":[
 *         {
 *             "UserName":"asdsad",
 *             "ID":21
 *         },
 *         {
 *             "UserName":"erwer",
 *             "ID":23
 *         },
 *     ],
 *     "info":{
 *         "date":"example_date",
 *         "endpoint":"/getListOfOtherUsers"
 *     }
 * }}
 */
app.get('/getListOfOtherUsers', function (request, response) {
    var accesToken = request.headers['accestoken'];
    logInfo('/getListOfUsers received with Accestoken' + accesToken);

    if (isTokenLegid(accesToken)) {
        var userID = selectIDBasedOnToken(accesToken);

        connection.query("select UserName, ID from users where ID!='" + userID + "' and ID!=0;", function (error, dbResponse) {
            //Handle error
            if (error) {
                logInfo(error);
                var errorResponse = {
                    response: {
                        message: "ERROR",
                        data: "GENERIC_ERROR",
                        info: {
                            date: "example_date",
                            endpoint: "/getListOfOtherUsers"
                        }
                    }
                };
                response.end(JSON.stringify(errorResponse));
            }
            //query ok
            var successResponse = {
                response: {
                    message: "SUCCESS",
                    data: dbResponse,
                    info: {
                        date: "example_date",
                        endpoint: "/getListOfOtherUsers"
                    }
                }
            };
            response.end(JSON.stringify(successResponse));
        });
    } else {
        var errorResponse = {
            response: {
                message: "ERROR",
                data: "TOKEN_NOT_VALID",
                info: {
                    date: "example_date",
                    endpoint: "/getListOfOtherUsers"
                }
            }
        };
        response.end(JSON.stringify(errorResponse));
    }
});

/*
 * api endpoint /me
 * get the info of the logged in user.
 * tests if request has a valid token and
 * matches user based on token.
 * 
 * Expexted header type: {Accestoken : "30535045103169976"}
 * 
 * Expected json output:
 * {"response":{
 *     "message":"SUCCESS",
 *     "data":[
 *         {
 *             "ID":25,
 *             "UserName":"kallejoo",
 *             "UserPassword":"kalle",
 *             "LastName":"Kalle",
 *             "FirstName":"Joo"
 *         }
 *     ],
 *     "info":{
 *         "date":"example_date",
 *         "endpoint":"/me"
 *     }
 * }}
 */
app.get('/me', function (request, response) {
    var accesToken = request.headers['accestoken'];
    logInfo('/me received with Accestoken' + accesToken);

    if (isTokenLegid(accesToken)) {
        var userID = selectIDBasedOnToken(accesToken);

        connection.query("select ID, UserName, LastName, FirstName from users where ID='" + userID + "';", function (error, dbResponse) {
            //Handle error
            if (error) {
                logInfo(error);
                var errorResponse = {
                    response: {
                        message: "ERROR",
                        data: "GENERIC_ERROR",
                        info: {
                            date: "example_date",
                            endpoint: "/me"
                        }
                    }
                };
                response.end(JSON.stringify(errorResponse));
            }

            //query ok
            var successResponse = {
                response: {
                    message: "SUCCESS",
                    data: dbResponse,
                    info: {
                        date: "example_date",
                        endpoint: "/me"
                    }
                }
            };
            response.end(JSON.stringify(successResponse));
        });
    } else {
        var errorResponse = {
            response: {
                message: "ERROR",
                data: "TOKEN_NOT_VALID",
                info: {
                    date: "example_date",
                    endpoint: "/me"
                }
            }
        };
        response.end(JSON.stringify(errorResponse));
    }
});

/*
 * api endpoint /getListOfMyGames
 * get the info of the logged in user.
 * tests if request has a valid token and
 * matches user based on token.
 * 
 * Expexted header type: {Accestoken : "30535045103169976"}
 * 
 * {"response":{
 *     "message":"SUCCESS",
 *     "data":[
 *         {
 *             "Room_ID":1,
 *             "Title":"Taskubilis",
 *             "StartingDate":null,
 *             "EndingDate":null,
 *             "PrivateGame":0,
 *             "AdminUserID":1,
 *             "AdminUserName":null,
 *             "Score":"2-1",
 *             "Player1":26,
 *             "Player1UserName":"pouko",
 *             "Player2":25,
 *             "Player2UserName":"kallejoo"
 *         },
 *         {
 *             "Room_ID":2,
 *             "Title":"Taskubilis2",
 *             "StartingDate":null,
 *             "EndingDate":null,
 *             "PrivateGame":0,
 *             "AdminUserID":1,
 *             "AdminUserName":null,
 *             "Score":"2-1",
 *             "Player1":1,
 *             "Player1UserName":"Smygmi",
 *             "Player2":25,
 *             "Player2UserName":"kallejoo"
 *         }
 *     ],
 *     "info":{
 *         "date":"example_date",
 *         "endpoint":"/getListOfMyGames"
 *     }
 *}}
 */
app.get('/getListOfMyGames', function (request, response) {
    var accesToken = request.headers['accestoken'];
    logInfo('/getListOfMyGames received with Accestoken' + accesToken);

    if (isTokenLegid(accesToken)) {
        var userID = selectIDBasedOnToken(accesToken);

        connection.query("select * from 2_player_rooms where Player1='" + userID + "' or Player2='" + userID + "' ;", function (error, dbResponse) {
            //Handle error
            if (error) {
                logInfo(error);
                var errorResponse = {
                    response: {
                        message: "ERROR",
                        data: "GENERIC_ERROR",
                        info: {
                            date: "example_date",
                            endpoint: "/getListOfMyGames"
                        }
                    }
                };
                response.end(JSON.stringify(errorResponse));
            }
            //query ok
            var successResponse = {
                response: {
                    message: "SUCCESS",
                    data: dbResponse,
                    info: {
                        date: "example_date",
                        endpoint: "/getListOfMyGames"
                    }
                }
            };
            response.end(JSON.stringify(successResponse));
        });
    } else {
        var errorResponse = {
            response: {
                message: "ERROR",
                data: "TOKEN_NOT_VALID",
                info: {
                    date: "example_date",
                    endpoint: "/getListOfMyGames"
                }
            }
        };
        response.end(JSON.stringify(errorResponse));
    }
});

/*
 * api endpoint /getListOfGamesToJoin
 * get a list of gamerooms were there is an empty place
 * 
 * tests if request has a valid token and
 * matches user based on token.
 * 
 * Expexted header type: {Accestoken : "30535045103169976"}
 * 
 * Expected json output:
 * {"response":{
 *     "message":"SUCCESS",
 *     "data":[
 *         {
 *             "Room_ID":21,
 *             "Title":"T3747231081006796.5",
 *             "StartingDate":"",
 *             "EndingDate":"",
 *             "PrivateGame":0,
 *             "AdminUserID":25,
 *             "AdminUserName":"kallejoo",
 *             "Score":"0-0",
 *             "Player1":null,
 *             "Player1UserName":null,
 *             "Player2":25,
 *             "Player2UserName":"kallejoo"
 *         },
 *         {
 *             "Room_ID":23,
 *             "Title":"T7394005587140489",
 *             "StartingDate":"",
 *             "EndingDate":"",
 *             "PrivateGame":0,
 *             "AdminUserID":25,
 *             "AdminUserName":"kallejoo",
 *             "Score":"0-0",
 *             "Player1":null,
 *             "Player1UserName":null,
 *             "Player2":25,
 *             "Player2UserName":"kallejoo"
 *         }],
 *         "info":{
 *             "date":"example_date",
 *             "endpoint":"/getListOfGamesToJoin"
 *         }
 * }}
 */
app.get('/getListOfGamesToJoin', function (request, response) {
    var accesToken = request.headers['accestoken'];
    logInfo('/getListOfGamesToJoin received with Accestoken' + accesToken);

    if (isTokenLegid(accesToken)) {
        var userID = selectIDBasedOnToken(accesToken);

        connection.query("select * from 2_player_rooms where ( PrivateGame=false ) &&( Player1 is NULL or Player2 is NULL ) && ( ( Player1!=" + userID + " or  Player2!=" + userID + " ) or ( Player1 is NULL and Player2 is NULL ));", function (error, dbResponse) {
            //Handle error
            if (error) {
                logInfo(error);
                var errorResponse = {
                    response: {
                        message: "ERROR",
                        data: "GENERIC_ERROR",
                        info: {
                            date: "example_date",
                            endpoint: "/getListOfOtherUsers"
                        }
                    }
                };
                response.end(JSON.stringify(errorResponse));
            }
            //query ok
            var successResponse = {
                response: {
                    message: "SUCCESS",
                    data: dbResponse,
                    info: {
                        date: "example_date",
                        endpoint: "/getListOfOtherUsers"
                    }
                }
            };
            response.end(JSON.stringify(successResponse));
        });
    } else {
        var errorResponse = {
            response: {
                message: "ERROR",
                data: "TOKEN_NOT_VALID",
                info: {
                    date: "example_date",
                    endpoint: "/getListOfOtherUsers"
                }
            }
        };
        response.end(JSON.stringify(errorResponse));
    }
});

/*
 * api endpoint /create_user
 * Makes a mysql query to the smygmis_database.users
 * 
 * Wants a unique UserName
 * Expected json input:
 * {"data":{
 *	"UserName":"Post testi4",
 *	"UserPassword":"kissa",
 *	"LastName":"Jarvenpaa",
 *	"FirstName":"Reetta"
 *	}
 * } 
 * 
 * General output
 * {"response":{
 *      "message":"SUCCESS",
 *      "data":"User created",
 *      "info":{
 *          "date":"example_date",
 *          "endpoint":"example_url"
 *          }
 *      }
 * }
 */
app.post('/create_user', function (request, response) {
    var jsonString = '';

    logInfo('create_user received');

    request.on('data', function (data) {
        jsonString += data;
    });

    request.on('end', function () {
        logInfo("Following json received" + jsonString);
        //Insert query here.
        var json = JSON.parse(jsonString);
        json = json.data;
        connection.query("INSERT INTO users (UserName,UserPassword,LastName,FirstName) VALUES ('" + json.UserName + "','" + json.UserPassword + "','" + json.LastName + "','" + json.FirstName + "');",
                function (error, dbResponse) {
                    //Error handling
                    if (error) {
                        if (error.code === "ER_DUP_ENTRY") {
                            var errorResponse = {
                                response: {
                                    message: "ERROR",
                                    data: "ER_DUP_ENTRY",
                                    info: {
                                        date: "example_date",
                                        endpoint: "create_user"
                                    }
                                }
                            };
                            response.end(JSON.stringify(errorResponse));
                        }
                        var errorResponse = {
                            response: {
                                message: "ERROR",
                                data: "GENERIC_ERROR",
                                info: {
                                    date: "example_date",
                                    endpoint: "create_user"
                                }
                            }
                        };
                        response.end(JSON.stringify(errorResponse));
                        logInfo(error.code);
                    }
                    //Success. User created
                    //generate token for user
                    logInfo("User greated with id " + dbResponse.insertId);
                    //Generate Accestoken and send response.
                    var newAccestoken = createAccesToken();
                    newAccestoken = "" + newAccestoken;
                    acceptableAccestokens.push({Accestoken: newAccestoken, UserName: json.UserName, ID: dbResponse.insertId});

                    var successResponse = {
                        response: {
                            message: "SUCCESS",
                            data: {UserName: json.UserName, AccesToken: newAccestoken},
                            info: {
                                date: "example_date",
                                endpoint: "create_user"
                            }
                        }
                    };
                    response.end(JSON.stringify(successResponse));
                });
    });
});

/*
 * api endpoint /log_in 
 * Makes a mysql query to the smygmis_database.users
 * user log in check. Generates 16 digid Accestoken if successfull
 * 
 * Expected input json:
 * {"data":{
 *     "UserName":"jgjg",
 *     "UserPassword":"sdfdsfsdffds"
 *     }
 * }
 * 
 * General output
 * {"response":{
 *      "message":"SUCCESS",
 *      "data":{"UserName":"jgjg","AccesToken":85815575253218420},
 *      "info":{
 *          "date":"example_date",
 *          "endpoint":"example_url"
 *          }
 *      }
 * }
 */

app.post('/log_in', function (request, response) {
    var jsonString = '';

    logInfo('log_in received');

    request.on('data', function (data) {
        jsonString += data;
    });

    request.on('end', function () {
        logInfo("Following json received" + jsonString);
        //Insert query here.
        var json = JSON.parse(jsonString);
        json = json.data;
        connection.query("select UserName, ID from users where UserName='" + json.UserName + "' and UserPassword='" + json.UserPassword + "';",
                function (error, dbResponse) {
                    //Error handling
                    if (error) {
                        var errorResponse = {
                            response: {
                                message: "ERROR",
                                data: "GENERIC_ERROR",
                                info: {
                                    date: "example_date",
                                    endpoint: "example_url"
                                }
                            }
                        };
                        response.end(JSON.stringify(errorResponse));
                        logInfo(error.code);
                    }
                    //Succesful result received
                    //Was user found
                    if (dbResponse.length === 1) {
                        logInfo("Log in succes " + dbResponse[0].ID);
                        //Generate Accestoken and send response.
                        var newAccestoken = createAccesToken();
                        newAccestoken = "" + newAccestoken;
                        acceptableAccestokens.push({Accestoken: newAccestoken, UserName: dbResponse[0].UserName, ID: dbResponse[0].ID});

                        var successResponse = {
                            response: {
                                message: "SUCCESS",
                                data: {UserName: dbResponse[0].UserName, AccesToken: newAccestoken},
                                info: {
                                    date: "example_date",
                                    endpoint: "example_url"
                                }
                            }
                        };
                        response.end(JSON.stringify(successResponse));
                    }
                    //Wrong username password combo
                    else {
                        logInfo("Log in failure");
                        var successResponse = {
                            response: {
                                message: "FAILURE",
                                data: "Wrong username password combo",
                                info: {
                                    date: "example_date",
                                    endpoint: "example_url"
                                }
                            }
                        };

                        response.end(JSON.stringify(successResponse));
                    }
                });
    });
});

/*
 * api endpoint /createGameRoom 
 * post a new gameroom to smygmis_database.2_player_rooms
 * tests if request has a valid token and
 * matches creator of the room based on token.
 * 
 * Expexted header type: {Accestoken : "30535045103169976"}
 * 
 * Expected input json:
 * {
 * "data":{
 *      "Title":"T7223573513456725",
 *      "StartingDate":"",
 *      "EndingDate":"",
 *      "PrivateGame":false,
 *      "Score":"0-0",
 *      "Player1":1,
 *      "Player1UserName":"Smygmi",
 *      "Player2":25,
 *      "Player2UserName":"kallejoo"
 *      }
 * }
 * 
 * General output:
 * {"response":{
 *      "message":"ERROR",
 *      "data":"TOKEN_NOT_VALID",
 *      "info":{
 *          "date":"example_date",
 *          "endpoint":"/createGameRoom"
 *      }
 * }}
 */
app.post('/createGameRoom', function (request, response) {
    logInfo('/createGameRoom received with Accestoken' + accesToken);
    var accesToken = request.headers['accestoken'];

    if (isTokenLegid(accesToken)) {
        var userID = selectIDBasedOnToken(accesToken);
        var userName = selectUserBasedOnToken(accesToken);
        var jsonString = "";

        request.on('data', function (data) {
            jsonString += data;
        });

        request.on('end', function () {
            var json = JSON.parse(jsonString);
            json = json.data;
            console.log("Json received was: " + JSON.stringify(json));

            var queryBeginning = "INSERT INTO 2_player_rooms (Title,StartingDate,EndingDate,PrivateGame,AdminUserID,AdminUserName,Score";
            var queryEnding = "VALUES ('" + json.Title + "','" +
                    json.StartingDate + "','" +
                    json.EndingDate + "'," +
                    json.PrivateGame + "," +
                    userID + ",'" +
                    userName + "','" +
                    json.Score + "'";

            if (json.Player1) {
                console.log("Player1 was received");
                queryBeginning = queryBeginning + ",Player1,Player1UserName";
                queryEnding = queryEnding + "," + json.Player1 + ",'" + json.Player1UserName + "'";
            }
            if (json.Player2) {
                console.log("Player2 was received");
                queryBeginning = queryBeginning + ",Player2,Player2UserName";
                queryEnding = queryEnding + "," + json.Player2 + ",'" + json.Player2UserName + "'";
            }

            console.log(queryBeginning + ") " + queryEnding + ");");
            connection.query(queryBeginning + ") " + queryEnding + ");",
                    function (error, dbResponse) {
                        //Handle error
                        if (error) {
                            logInfo(error);
                            var errorResponse = {
                                response: {
                                    message: "ERROR",
                                    data: "GENERIC_ERROR",
                                    info: {
                                        date: "example_date",
                                        endpoint: "/createGameRoom"
                                    }
                                }
                            };
                            response.end(JSON.stringify(errorResponse));
                        }

                        //query ok
                        var successResponse = {
                            response: {
                                message: "SUCCESS",
                                data: "GAMEROOM_CREATED",
                                info: {
                                    date: "example_date",
                                    endpoint: "/createGameRoom"
                                }
                            }
                        };
                        response.end(JSON.stringify(successResponse));
                    });
        });
    } else {
        var errorResponse = {
            response: {
                message: "ERROR",
                data: "TOKEN_NOT_VALID",
                info: {
                    date: "example_date",
                    endpoint: "/createGameRoom"
                }
            }
        };
        response.end(JSON.stringify(errorResponse));
    }
});

/*
 * api endpoint /joinGame 
 * post an update to a gameroom in smygmis_database.2_player_rooms
 * 
 * tests if request has a valid token and
 * matches joining palyer based on token.
 * 
 * Expexted header type: {Accestoken : "30535045103169976"}
 * 
 * Expected input json:
 *  {
 *  	"data":{
 *  		Room_ID : 24,
 *  		Player1 : true
 *          }
 *  }
 *   OR:
 *  {
 *   	"data":{
 *   		Room_ID : 24,
 *   		Player2 : true
 *           }
 *  }
 *  
 *  Expected output json:
 *  {
 *      "response":{
 *          "message":"SUCCESS",
 *          "data":"GAMEROOM_JOIN_SUCCESS",
 *          "info":{
 *              "date":"example_date",
 *              "endpoint":"/joinGame"
 *          }
 *      }
 *  }
 */
app.post('/joinGame', function (request, response) {
    logInfo('/joinGame received with Accestoken' + accesToken);
    var accesToken = request.headers['accestoken'];

    if (isTokenLegid(accesToken)) {
        var userID = selectIDBasedOnToken(accesToken);
        var userName = selectUserBasedOnToken(accesToken);
        var jsonString = "";

        request.on('data', function (data) {
            jsonString += data;
        });

        request.on('end', function () {
            var json = JSON.parse(jsonString);
            json = json.data;
            console.log("Json received was: " + JSON.stringify(json));

            var query = "update 2_player_rooms set";

            if (json.Player1) {
                console.log("Player1 was received");
                query = query + " Player1=" + userID + ", Player1UserName='" + userName + "'";

            }
            if (json.Player2) {
                console.log("Player2 was received");
                query = query + " Player2=" + userID + ", Player2UserName='" + userName + "'";
            }

            console.log(query + " where Room_ID=" + json.Room_ID + ";");
            connection.query(query + " where Room_ID=" + json.Room_ID + ";",
                    function (error, dbResponse) {
                        //Handle error
                        if (error) {
                            logInfo(error);
                            var errorResponse = {
                                response: {
                                    message: "ERROR",
                                    data: "GENERIC_ERROR",
                                    info: {
                                        date: "example_date",
                                        endpoint: "/joinGame"
                                    }
                                }
                            };
                            response.end(JSON.stringify(errorResponse));
                        }

                        //query ok
                        var successResponse = {
                            response: {
                                message: "SUCCESS",
                                data: "GAMEROOM_JOIN_SUCCESS",
                                info: {
                                    date: "example_date",
                                    endpoint: "/joinGame"
                                }
                            }
                        };
                        response.end(JSON.stringify(successResponse));
                    });
        });
    } else {
        var errorResponse = {
            response: {
                message: "ERROR",
                data: "TOKEN_NOT_VALID",
                info: {
                    date: "example_date",
                    endpoint: "/joinGame"
                }
            }
        };
        response.end(JSON.stringify(errorResponse));
    }
});

/*
 * api endpoint /updateScore 
 * put an update to a gameroom in smygmis_database.2_player_rooms
 * 
 * tests if request has a valid token and
 * 
 * Expexted header type: {Accestoken : "30535045103169976"}
 * 
 * Expected input json:
 *  {
 *  	"data":{
 *  		Room_ID : 24,
 *  		Score : "100-0"
 *          }
 *  }
 *  
 *  Expected output json:
 *  {
 *      "response":{
 *          "message":"SUCCESS",
 *          "data":"GAMEROOM_UPDATE_SUCCESS",
 *          "info":{
 *              "date":"example_date",
 *              "endpoint":"/updateScore"
 *          }
 *      }
 *  }
 */
app.put('/updateScore', function (request, response) {
    var accesToken = request.headers['accestoken'];
    logInfo('/updateScore received with Accestoken' + accesToken);

    if (isTokenLegid(accesToken)) {
        var jsonString = "";

        request.on('data', function (data) {
            jsonString += data;
        });

        request.on('end', function () {
            var json = JSON.parse(jsonString);
            json = json.data;
            console.log("Json received was: " + JSON.stringify(json));

            var query = "update 2_player_rooms set Score='" + json.Score + "'";

            console.log(query + " where Room_ID=" + json.Room_ID + ";");
            connection.query(query + " where Room_ID=" + json.Room_ID + ";",
                    function (error, dbResponse) {
                        //Handle error
                        if (error) {
                            logInfo(error);
                            var errorResponse = {
                                response: {
                                    message: "ERROR",
                                    data: "GENERIC_ERROR",
                                    info: {
                                        date: "example_date",
                                        endpoint: "/updateScore"
                                    }
                                }
                            };
                            response.end(JSON.stringify(errorResponse));
                        }

                        //query ok
                        var successResponse = {
                            response: {
                                message: "SUCCESS",
                                data: "GAMEROOM_UPDATE_SUCCESS",
                                info: {
                                    date: "example_date",
                                    endpoint: "/updateScore"
                                }
                            }
                        };
                        response.end(JSON.stringify(successResponse));
                    });
        });
    } else {
        var errorResponse = {
            response: {
                message: "ERROR",
                data: "TOKEN_NOT_VALID",
                info: {
                    date: "example_date",
                    endpoint: "/updateScore"
                }
            }
        };
        response.end(JSON.stringify(errorResponse));
    }
});

//Load routes
require('./routes')(router);

app.use('/', router);

//Load certificates
var serverhttps = https.createServer(cert, app);

serverhttps.listen(config.PORT, function () {
    console.log("Express server running at port: " + config.PORT);
});

/**************************Functions*****************************************/


function logInfo(somethingToLog) {
    console.log(somethingToLog);

    //to do log info to a file too.
}