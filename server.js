/*
 * Smygmis_web_server 2016
 * ©Ville Hernesniemi
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

 
 var express = require('express');
 var app = express();
 
 var fs = require('fs');
 
 var mysql = require('mysql');
 var connection = mysql.createConnection(
         {
            host    :   'localhost',
            user    :   's_web_server',
            password:   '5ZXsusi5',
            database:   'smygmis_database'
         }     
    );
connection.connect();    
 
 var PORT = 8081;
 var SITE_ROOT = "/home/pi/programming/node-js/Smygmis_web_server/";
 
 var HTTP_STATUS_OK = 200;
 var HTTP_STATUS_NOT_FOUND = 404;
 var MIME_TYPE_APPLICATION_JSON = { 'Content-Type': 'application/json'};
 var MIME_TYPE_TEXT_PLAIN = { 'Content-Type': 'text/plain'};
 var MIME_TYPE_TEXT_HTML = { 'Content-Type': 'text/html'};
 var MIME_TYPE_TEXT_JS = { 'Content-Type': 'text/JavaScript'};
 var MIME_TYPE_TEXT_CSS = { 'Content-Type': 'text/css'};

/*
 * Example response structure:
 */
function finnishedResponse(){
    response :{
      message : "message_code";
      data : "example_data";
      info : {
         date : "example_date";
         endpoint : "example_url";
      };
   };
}
/*tokens the server accepts tied to UserName and Id
 *
 *Exapmle structure:
 *{ 
 *  Accestoken: newAccestoken,
 *  UserName : dbResponse[0].UserName, 
 *  ID : dbResponse[0].ID 
 *}
 *
 */
var acceptableAccestokens = [];

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
 *     
 *  to do list
 *     /addPlayerToRoom
 *     /updateScore       
 *     games with more that 2 payers
 *     tournaments
 *     leagues
 *     email notifications
 *     profile picture  !!Support for url is in mysql    
 */
 
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
 app.get('/getListOfOtherUsers', function(request, response){
    var accesToken = request.headers['accestoken']; 
    logInfo('/getListOfUsers received with Accestoken' + accesToken);    
     
    if( isTokenLegid( accesToken ) ) {
        var userID = selectIDBasedOnToken( accesToken );
        
        connection.query("select UserName, ID from users where ID!='"+ userID +"' and ID!=0;", function(error, dbResponse){
            //Handle error
            if(error){
                logInfo(error);
                var errorResponse = {
                    response : {
                        message : "ERROR",
                        data : "GENERIC_ERROR",
                        info : {
                            date : "example_date",
                            endpoint : "/getListOfOtherUsers"
                        }
                    }
                };
                response.end( JSON.stringify( errorResponse ) );
            }
            //query ok
            var successResponse = {
                response : {
                    message : "SUCCESS",
                    data : dbResponse,
                    info : {
                        date : "example_date",
                        endpoint : "/getListOfOtherUsers"
                    }
                }
            };
            response.end( JSON.stringify( successResponse ) );
        });        
    }
    else{
        var errorResponse = {
            response : {
                message : "ERROR",
                data : "TOKEN_NOT_VALID",
                info : {
                    date : "example_date",
                    endpoint : "/getListOfOtherUsers"
                }
            }
        };
        response.end( JSON.stringify( errorResponse ) );
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
 app.get('/me', function(request, response){
    var accesToken = request.headers['accestoken']; 
    logInfo('/me received with Accestoken' + accesToken);    
     
    if( isTokenLegid( accesToken ) ) {
        var userID = selectIDBasedOnToken( accesToken );
        
        connection.query("select ID, UserName, LastName, FirstName from users where ID='" + userID + "';", function(error, dbResponse){
            //Handle error
            if(error){
                logInfo(error);
                var errorResponse = {
                    response : {
                        message : "ERROR",
                        data : "GENERIC_ERROR",
                        info : {
                            date : "example_date",
                            endpoint : "/me"
                        }
                    }
                };
                response.end( JSON.stringify( errorResponse ) );
            }
            
            //query ok
            var successResponse = {
                response : {
                    message : "SUCCESS",
                    data : dbResponse,
                    info : {
                        date : "example_date",
                        endpoint : "/me"
                    }
                }
            };
            response.end( JSON.stringify( successResponse ) );                 
        });        
    }
    else{
        var errorResponse = {
            response : {
                message : "ERROR",
                data : "TOKEN_NOT_VALID",
                info : {
                    date : "example_date",
                    endpoint : "/me"
                }
            }
        };
        response.end( JSON.stringify( errorResponse ) );
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
 app.get('/getListOfMyGames', function(request, response){
    var accesToken = request.headers['accestoken']; 
    logInfo('/getListOfMyGames received with Accestoken' + accesToken);    
     
    if( isTokenLegid( accesToken ) ) {
        var userID = selectIDBasedOnToken( accesToken );
        
        connection.query("select * from 2_player_rooms where Player1='"+ userID +"' or Player2='"+ userID +"' ;", function(error, dbResponse){
            //Handle error
            if(error){
                logInfo(error);
                var errorResponse = {
                    response : {
                        message : "ERROR",
                        data : "GENERIC_ERROR",
                        info : {
                            date : "example_date",
                            endpoint : "/getListOfMyGames"
                        }
                    }
                };
                response.end( JSON.stringify( errorResponse ) );
            }
            //query ok
            var successResponse = {
                response : {
                    message : "SUCCESS",
                    data : dbResponse,
                    info : {
                        date : "example_date",
                        endpoint : "/getListOfMyGames"
                    }
                }
            };
            response.end( JSON.stringify( successResponse ) );
        });        
    }
    else{
        var errorResponse = {
            response : {
                message : "ERROR",
                data : "TOKEN_NOT_VALID",
                info : {
                    date : "example_date",
                    endpoint : "/getListOfMyGames"
                }
            }
        };
        response.end( JSON.stringify( errorResponse ) );
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
app.get('/getListOfGamesToJoin', function(request, response){
    var accesToken = request.headers['accestoken']; 
    logInfo('/getListOfGamesToJoin received with Accestoken' + accesToken);    
     
    if( isTokenLegid( accesToken ) ) {        
        
        connection.query("select * from 2_player_rooms where Player1 is NULL or Player2 is NULL;", function(error, dbResponse){
            //Handle error
            if(error){
                logInfo(error);
                var errorResponse = {
                    response : {
                        message : "ERROR",
                        data : "GENERIC_ERROR",
                        info : {
                            date : "example_date",
                            endpoint : "/getListOfOtherUsers"
                        }
                    }
                };
                response.end( JSON.stringify( errorResponse ) );
            }
            //query ok
            var successResponse = {
                response : {
                    message : "SUCCESS",
                    data : dbResponse,
                    info : {
                        date : "example_date",
                        endpoint : "/getListOfOtherUsers"
                    }
                }
            };
            response.end( JSON.stringify( successResponse ) );
        });        
    }
    else{
        var errorResponse = {
            response : {
                message : "ERROR",
                data : "TOKEN_NOT_VALID",
                info : {
                    date : "example_date",
                    endpoint : "/getListOfOtherUsers"
                }
            }
        };
        response.end( JSON.stringify( errorResponse ) );
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
  app.post('/create_user', function(request, response){
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
                connection.query("INSERT INTO users (UserName,UserPassword,LastName,FirstName) VALUES ('" + json.UserName + "','" + json.UserPassword + "','" + json.LastName + "','" + json.FirstName + "');" , 
                function(error, dbResponse){
                    //Error handling
                    if(error){
                        if(error.code === "ER_DUP_ENTRY"){
                            var errorResponse = {
                                response : {
                                    message : "ERROR",
                                    data : "ER_DUP_ENTRY",
                                    info : {
                                        date : "example_date",
                                        endpoint : "example_url"
                                    }
                                }
                            };
                            response.end( JSON.stringify( errorResponse ) ); 
                        }
                        var errorResponse = {
                                response : {
                                    message : "ERROR",
                                    data : "GENERIC_ERROR",
                                    info : {
                                        date : "example_date",
                                        endpoint : "example_url"
                                    }
                                }
                            };
                            response.end( JSON.stringify( errorResponse ) );
                        logInfo(error.code); 
                    }
                    //Success. User greated
                    var successResponse = {
                                response : {
                                    message : "SUCCESS",
                                    data : {UserName : json.UserName},
                                    info : {
                                        date : "example_date",
                                        endpoint : "example_url"
                                    }
                                }
                            };
                    
                    response.end(JSON.stringify( successResponse ) ); 
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
 
 app.post('/log_in', function(request, response){
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
                connection.query("select UserName, ID from users where UserName='" + json.UserName + "' and UserPassword='" + json.UserPassword + "';" , 
                function(error, dbResponse){
                    //Error handling
                    if(error){
                        var errorResponse = {
                                response : {
                                    message : "ERROR",
                                    data : "GENERIC_ERROR",
                                    info : {
                                        date : "example_date",
                                        endpoint : "example_url"
                                    }
                                }
                            };
                            response.end( JSON.stringify( errorResponse ) );
                        logInfo(error.code); 
                    }
                    //Succesful result received
                    //Was user found
                    if(dbResponse.length === 1){
                        logInfo("Log in succes " + dbResponse[0].ID);
                        //Generate Accestoken and send response.
                        var newAccestoken = createAccesToken();
                        newAccestoken = "" + newAccestoken;
                        acceptableAccestokens.push( { Accestoken: newAccestoken, UserName : dbResponse[0].UserName, ID : dbResponse[0].ID } );												                    
                        
						var successResponse = {
                                    response : {
                                        message : "SUCCESS",
                                        data : {UserName : dbResponse[0].UserName, AccesToken : newAccestoken},
                                        info : {
                                            date : "example_date",
                                            endpoint : "example_url"
                                        }
                                    }
                                };
                        response.end(JSON.stringify( successResponse ) );
                    }
                    //Wrong username password combo
                    else{
                        logInfo("Log in failure");
                        var successResponse = {
                                response : {
                                    message : "FAILURE",
                                    data : "Wrong username password combo",
                                    info : {
                                        date : "example_date",
                                        endpoint : "example_url"
                                    }
                                }
                            };
                    
                    response.end(JSON.stringify( successResponse ) );
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
 app.post('/createGameRoom', function(request, response){
    logInfo('/createGameRoom received with Accestoken' + accesToken); 
    var accesToken = request.headers['accestoken']; 
    
    if( isTokenLegid( accesToken ) ) {
        var userID = selectIDBasedOnToken( accesToken );
        var userName = selectUserBasedOnToken( accesToken );
        var jsonString = "";
        
        request.on('data', function (data) {
            jsonString += data;
        });
	
	request.on('end', function () {
            var json = JSON.parse(jsonString);
            json = json.data;
            console.log("Json received was: " + JSON.stringify( json ));
            
            var queryBeginning = "INSERT INTO 2_player_rooms (Title,StartingDate,EndingDate,PrivateGame,AdminUserID,AdminUserName,Score";
            var queryEnding = "VALUES ('"+json.Title + "','" +
                        json.StartingDate + "','"+
                        json.EndingDate + "',"+
                        json.PrivateGame + ","+
                        userID + ",'" +
                        userName + "','" + 
                        json.Score + "'";
                
            if(json.Player1){
                console.log("Player1 was received");
                queryBeginning = queryBeginning + ",Player1,Player1UserName";
                queryEnding = queryEnding + "," +json.Player1 + ",'" + json.Player1UserName + "'";
            }
            if(json.Player2){
                console.log("Player2 was received");
                queryBeginning = queryBeginning + ",Player2,Player2UserName";
                queryEnding = queryEnding + "," +json.Player2 + ",'" + json.Player2UserName + "'";
            }
            
            console.log(queryBeginning + ") " + queryEnding + ");");
            connection.query( queryBeginning + ") " + queryEnding + ");",
            function(error, dbResponse){
                //Handle error
                if(error){
                    logInfo(error);
                    var errorResponse = {
                        response : {
                            message : "ERROR",
                            data : "GENERIC_ERROR",
                            info : {
                                date : "example_date",
                                endpoint : "/createGameRoom"
                            }
                        }
                    };
                    response.end( JSON.stringify( errorResponse ) );
                }

                //query ok
                var successResponse = {
                    response : {
                        message : "SUCCESS",
                        data : "GAMEROOM_CREATED",
                        info : {
                            date : "example_date",
                            endpoint : "/createGameRoom"
                        }
                    }
                };
                response.end( JSON.stringify( successResponse ) );                 
            });
        });
    }
    else{
        var errorResponse = {
            response : {
                message : "ERROR",
                data : "TOKEN_NOT_VALID",
                info : {
                    date : "example_date",
                    endpoint : "/createGameRoom"
                }
            }
        };
        response.end( JSON.stringify( errorResponse ) );
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
 app.post('/joinGame', function(request, response){
    logInfo('/joinGame received with Accestoken' + accesToken); 
    var accesToken = request.headers['accestoken']; 
    
    if( isTokenLegid( accesToken ) ) {
        var userID = selectIDBasedOnToken( accesToken );
        var userName = selectUserBasedOnToken( accesToken );
        var jsonString = "";
        
        request.on('data', function (data) {
            jsonString += data;
        });
	
	request.on('end', function () {
            var json = JSON.parse(jsonString);
            json = json.data;
            console.log("Json received was: " + JSON.stringify( json ));
            
            var query = "update 2_player_rooms set";
                
            if(json.Player1){
                console.log("Player1 was received");
                query = query + " Player1=" + userID + ", Player1UserName='" + userName + "'";
                
            }
            if(json.Player2){
                console.log("Player2 was received");
                query = query + " Player2=" + userID + ", Player2UserName='" + userName + "'";
            }
            
            console.log( query + " where Room_ID=" + json.Room_ID + ";" );
            connection.query( query + " where Room_ID=" + json.Room_ID + ";",
            function(error, dbResponse){
                //Handle error
                if(error){
                    logInfo(error);
                    var errorResponse = {
                        response : {
                            message : "ERROR",
                            data : "GENERIC_ERROR",
                            info : {
                                date : "example_date",
                                endpoint : "/joinGame"
                            }
                        }
                    };
                    response.end( JSON.stringify( errorResponse ) );
                }

                //query ok
                var successResponse = {
                    response : {
                        message : "SUCCESS",
                        data : "GAMEROOM_JOIN_SUCCESS",
                        info : {
                            date : "example_date",
                            endpoint : "/joinGame"
                        }
                    }
                };
                response.end( JSON.stringify( successResponse ) );                 
            });
        });
    }
    else{
        var errorResponse = {
            response : {
                message : "ERROR",
                data : "TOKEN_NOT_VALID",
                info : {
                    date : "example_date",
                    endpoint : "/joinGame"
                }
            }
        };
        response.end( JSON.stringify( errorResponse ) );
    }
});

 var server = app.listen(PORT);
 logInfo("Express server running at port: "+ PORT);
 
 /**************************Functions*****************************************/
 
 //Make sure that Accestoken is unique
 function createAccesToken(){
	var tokenOk = false;
	
	while(!tokenOk){
		var createdToken = Math.random() * 100000000000000000;
		tokenOk = true;
		
		for(var i; i <acceptableAccestokens.length; i++){
			if( acceptableAccestokens[i].Accestoken === createdToken ){
				tokenOk = false;;	
			}			
		}
	}		
	logInfo("Unique token greated!");	
	return(createdToken);
 }
 
 //Test if token is in the acceptableAccestokens.Accestoken array
 function isTokenLegid(tokenInTest){
	var tokenOk = false;
	logInfo("Tokens length was " + acceptableAccestokens.length);
	for(var i = 0; i <acceptableAccestokens.length; i++){
            
		if( acceptableAccestokens[i].Accestoken === tokenInTest ){
                    
                    tokenOk = true;;	
		}			
	}
	return tokenOk;
 }
 
 //match UserName to Accestoken
 function selectUserBasedOnToken(tokenInTest){
    logInfo("Token in test is: " + tokenInTest +" and type is: " + typeof tokenInTest);
    for(var i =0; i <acceptableAccestokens.length; i++){
        if( acceptableAccestokens[i].Accestoken === tokenInTest ){
            return( acceptableAccestokens[i].UserName );	
	}			
    }
    return false;
 }

 //match ID to Accestoken
 function selectIDBasedOnToken(tokenInTest){
    logInfo("Token in test is: " + tokenInTest +" and type is: " + typeof tokenInTest);
    for(var i =0; i <acceptableAccestokens.length; i++){
        if( acceptableAccestokens[i].Accestoken === tokenInTest ){
            return( acceptableAccestokens[i].ID );	
	}			
    }
    return false;
 }
//function for loggin stuff on the server 
function logInfo(somethingToLog){
	 console.log(somethingToLog);
	 
	 //to do log info to a file too.
}