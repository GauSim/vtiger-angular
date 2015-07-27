// https://wiki.vtiger.com/index.php/Webservices_tutorials
// http://community.vtiger.com/help/vtigercrm/developers/third-party-app-integration.html

var app = angular.module('main',[]);

app.run(function ($http, $rootScope) {
    
    //end point of the services.
    var endPointUrl = "https://viger-samsn.c9.io/vtigercrm/webservice.php";    
    var userKey ='YaPt4pWqt38pPgOs';
    var userName = 'admin';
    
    var __getToken = function (username,key) {
        return $http.get(endPointUrl+'?operation=getchallenge&username='+username)
        .then(function(data){ 
            return { token:data.data.result.token, key:key, username:username };
            
        });
    }
    var __login = function(tokenObj){
        
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
        };
        return $http(req).then(__response)
    }
    var __storeSession  = function (userObj) {
        if(typeof(Storage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            var str = JSON.stringify(userObj);
            localStorage.setItem("vt-login",str);
        } else 
            throw 'fail on localStorage';
        return userObj
    }
    var __response = function (r) {
        if(r.data.success){
            return r.data.result;
        }else
        throw r.data.error;
    }
    var __getSession = function (){ return JSON.parse(localStorage.getItem("vt-login")); }

    function listtypes() {
        var qry = {
            operation:'listtypes',
            sessionName:__getSession().sessionName
        };
        return $http.get(endPointUrl+'?'+$.param(qry)).then(__response);
    }
    
    function create (type, item){
        var task = {
            operation:'create',
            sessionName :__getSession().sessionName,
            elementType:type,
            element: JSON.stringify(item)
        }
        var req = {
             method: 'POST',
             url: endPointUrl,
             headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
             },
             data: $.param(task)
        } 
        return $http(req).then(__response);
    }
    function byId(type, id) {
        return query('SELECT * FROM '+type+' WHERE id = '+id+';');
    }
    function list(type){
        var q = squel.select().from(type).toString()+';';
        return query(q);
    }
    function query (query) {
        var task = {
            operation:'query',
            sessionName:__getSession().sessionName,
            query: query
        }
        return $http.get(endPointUrl+'?'+$.param(task)).then(__response);
    }
    
    function vtigerModule(type,info) {
        var self = this;
        self.information = info;
        self.byId = function (val){ return byId(type, val); };
        self.list = function (val){ return list(type); };
        self.create = function (item){ return create(type, item); };
        return self;
    }
    function vtigerConnecter (r) {
        var self = this;
        for (var k in  r.information){
            self[k] = new vtigerModule(k, r.information[k]);
        }
    }
    
    __getToken(userName, userKey)
    .then(__login)
    .then(__storeSession)
    .then(listtypes)
    .then(function (r) {
        //console.log(r);
        // $rootScope.output = r;
        
        var vtiger = new vtigerConnecter(r);
        window.vtiger = vtiger;
        
        console.dir(vtiger);
        $rootScope.output = vtiger;
        
        vtiger.Contacts.byId('12x7').then(function (r) {
           console.log(r);
        });
        
        vtiger.Contacts.list().then(function (r) {
           console.log(r);
        });
        
        /*
        
        var item = {
            lastname: 'Gausmann',
            firstname : 'Simon',
            phone:'',
            email:'',
            assigned_user_id : 1
        };
        
        create('Contacts', item).then(function (r) {
           console.log(r);
        })
        
        list('Contacts').then(function (r) {
           console.log(r);
        });
        
        byId('Contacts','12x7').then(function (r) {
           console.log(r);
        });
        
        */
        
    });
});