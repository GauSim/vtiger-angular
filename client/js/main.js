// https://wiki.vtiger.com/index.php/Webservices_tutorials
// http://community.vtiger.com/help/vtigercrm/developers/third-party-app-integration.html

var app = angular.module('main',[]);

app.run(function ($http, $rootScope) {
    
    //end point of the services.
    var endPointUrl = "https://viger-samsn.c9.io/vtigercrm/webservice.php";    
    var userKey ='YaPt4pWqt38pPgOs';
    var userName = 'admin';
    
    var _getToken = function (username,key) {
        return $http.get(endPointUrl+'?operation=getchallenge&username='+username)
        .then(function(data){ 
            return { token:data.data.result.token, key:key, username:username };
            
        });
    }
    var _login = function(tokenObj){
        
        var hash = CryptoJS.MD5(tokenObj.token+tokenObj.key);
        var accessKey = hash.toString();
        
        //console.log('userKey', userKey)
        //console.log('token:', token);
        //console.log('hash:', accessKey);
        
        var params = {
          operation: 'login',
          username : tokenObj.username,
          accessKey : accessKey
        };
    
        var req = {
             method: 'POST',
             url: endPointUrl,
             headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
             },
             data: $.param(params)
        }    
       
        return $http(req)
        .then(function(result){
            var data = result.data;
            if(data.success)
            {
                return data.result; 
            }
            else
                throw data.error;
        })
        .catch(function(errr){
            console.log(errr);
            throw errr;
        });
    }
    var _storeSession  = function (userObj) {
        var _userObj = {
            sessionName: "4f929b8655b54668e0482",
            userId: "19x1",
            version: "0.22",
            vtigerVersion: "6.3.0"
        }
        if(typeof(Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            var str = JSON.stringify(userObj);
            localStorage.setItem("vt-login",str);
        } else {
            throw 'fail on localStorage';
        }
        return userObj
    }

    var __response = function (r) {
        if(r.data.success){
            return r.data.result;
        }else
        throw r.data.error;
    }

    function listtypes(userObj) {
        var qry = {
            operation:'listtypes',
            sessionName:userObj.sessionName
        };
        var url = endPointUrl+'?'+$.param(qry);
        return $http.get(url).then(function (r) {
            return __response(r);
        })
    }
    
    _getToken(userName, userKey)
    .then(_login)
    .then(_storeSession)
    .then(listtypes)
    .then(function (types) {
        console.log(types);
        $rootScope.output = types;
    });
});