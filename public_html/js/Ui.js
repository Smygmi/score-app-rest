var currentUser = {
    UserName : "",
    AccesToken : ""    
};

document.getElementById('player1_button').addEventListener('click', testJoinGame);
document.getElementById('player2_button').addEventListener('click', testJoinGame);

function createUser(){
    var xmlhttp = new XMLHttpRequest();
    url = "/create_user";    
    var user = {
        data : {
            UserName : document.getElementById('user_name').value,
            UserPassword : document.getElementById('password').value,
            LastName : document.getElementById('lastName').value,
            FirstName : document.getElementById('firstName').value 	
        } 
    };
    //console.log(JSON.stringify( user ));
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;
        
    }
    };
    xmlhttp.open("POST", url, true);
    xmlhttp.send(JSON.stringify( user ));
}

function logIn(){
    var user = {
        data : {
            UserName : document.getElementById('user_name_log_in').value,
            UserPassword : document.getElementById('password_log_in').value            	
        } 
    };
    
    var xmlhttp = new XMLHttpRequest();
    url = "/log_in";
    
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;
        var json = JSON.parse( xmlhttp.responseText );
        currentUser.UserName = json.response.data.UserName;
        currentUser.AccesToken = json.response.data.AccesToken;
        
    }
    };
    xmlhttp.open("POST", url, true);
    xmlhttp.send(JSON.stringify( user ));
    
}

function testME(){
    var xmlhttp = new XMLHttpRequest();
    var url = "/me";
    
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;
        
    }
    };    
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("AccesToken", currentUser.AccesToken);
    xmlhttp.send();
}

function testGetListOfOtherUsers(){
    var xmlhttp = new XMLHttpRequest();
    var url = "/getListOfOtherUsers";
    
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;
        
    }
    };    
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("AccesToken", currentUser.AccesToken);
    xmlhttp.send();
}

function testGetListOfMyGames(){
    var xmlhttp = new XMLHttpRequest();
    var url = "/getListOfMyGames";
    
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;
        
    }
    };    
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("AccesToken", currentUser.AccesToken);
    xmlhttp.send();
}

function testCreateGameroom(){
    var message = {
        data : {
            Title : "T" + Math.random() * 10000000000000000,
            StartingDate : "",
            EndingDate : "",
            PrivateGame : false,
            Score : "0-0",
            Player1 : 1,
            Player1UserName : "Smygmi",
            Player2 : 25, 
            Player2UserName : "kallejoo"
        }        
    };
    
    var xmlhttp = new XMLHttpRequest();
    var url = "/createGameRoom";
    console.log( JSON.stringify( message ) );
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;
        
    }
    };    
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("AccesToken", currentUser.AccesToken);
    xmlhttp.send(JSON.stringify( message ) );
}

function testCreateGameroomLeaveEmpty(){
    var message = {
        data : {
            Title : "T" + Math.random() * 10000000000000000,
            StartingDate : "",
            EndingDate : "",
            PrivateGame : false,
            Score : "0-0",
            Player1 : 1,
            Player1UserName : "Smygmi"/*,
            Player2 : 25, 
            Player2UserName : "kallejoo"*/
        }        
    };
    
    var xmlhttp = new XMLHttpRequest();
    var url = "/createGameRoom";
    console.log( JSON.stringify( message ) );
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;
        
    }
    };    
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("AccesToken", currentUser.AccesToken);
    xmlhttp.send(JSON.stringify( message ) );
}

function testGetListOfGamesToJoin(){        
    var xmlhttp = new XMLHttpRequest();
    var url = "/getListOfGamesToJoin";
    
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;
        
    }
    };    
    xmlhttp.open("GET", url, true);
    xmlhttp.setRequestHeader("AccesToken", currentUser.AccesToken);
    xmlhttp.send();
}

function testJoinGame(e){
    console.log("testJoinGame triggeder!");
    console.log("Object was: " + e.target.id);
    
    if( e.target.id === "player1_button" ){
        
        var message = {
            data : {
                Room_ID : parseInt( document.getElementById('ID_OF_GAME_TO_JOIN').value ),
		Player1 : true
            }        
        };
    
        var xmlhttp = new XMLHttpRequest();
        var url = "/joinGame";
        console.log( JSON.stringify( message ) );
        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;

        }
        };    
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("AccesToken", currentUser.AccesToken);
        xmlhttp.send(JSON.stringify( message ) );
    }
    
    if( e.target.id === "player2_button" ){
        
        var message = {
            data : {
                Room_ID : parseInt( document.getElementById('ID_OF_GAME_TO_JOIN').value ),
		Player2 : true
            }        
        };
    
        var xmlhttp = new XMLHttpRequest();
        var url = "/joinGame";
        console.log( JSON.stringify( message ) );
        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById('responseMessage').innerHTML = xmlhttp.responseText;

        }
        };    
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("AccesToken", currentUser.AccesToken);
        xmlhttp.send(JSON.stringify( message ) );
    }
    
}