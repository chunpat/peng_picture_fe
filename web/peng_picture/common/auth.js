const FULL_CHARTER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopgrstuvwxyz';
const oauth_server='http://localhost:9510/';
const redirect_uri='http://localhost:8002/client-front/';
const client_id='demo';
const client_secret='demo';
const token_storage = localStorage;//sessionStorage
const account = '13726271208';//username
const password = ' 221222';//password
 
 
function ajaxSetup() {
    $.ajaxSetup({
        timeout : 30000,
        beforeSend : function(xhr) {
            //排除获取token请求
            // if(this.url.endsWith('/oauth/token')){
            //     return true;
            // }
            //查询本地token,如果没有就去获取或者刷新
            if (getAuth() == null){
                fetchToken();
            }
            var auth = getAuth();
            if(auth != null){
                xhr.setRequestHeader("Authorization", auth.token_type + ' ' + auth.access_token);
            } else {
                return false;
            }
            return true;
        },
        complete : function(xhr, ts) {
            if (xhr.status == 401 && xhr.responseJSON.error =='invalid_token') {
               refreshToken();
            }
        }
    });
}
 
function getAuth(){
    let auth = token_storage.getItem('auth');
    return JSON.parse(auth);
}
 
function saveAuth(sResponse){
    token_storage.setItem("auth", JSON.stringify(sResponse));
}
 
function clearAuth(){
    token_storage.removeItem('auth');
}
 
function logout(){
    token_storage.removeItem('auth');
    window.location.href = oauth_server+"/logout?redirect_uri="+redirect_uri;
}
 
function getCode(){
    var state='';
    for (var a=0;a<6;a++){
        state+=FULL_CHARTER[Math.floor(Math.random() * 52)];
    }
    var url = oauth_server+"/oauth/authorize?client_id="+client_id+"&client_secret="+client_secret+
            "&response_type=code&state="+state+"&redirect_uri="+redirect_uri;
    window.location = url;
 //window.open(url);
}
 
function fetchToken(){
    // let url = window.location.toString();
    // if(!url.includes('code')){
    //     getCode();
    // }
    // if(url.includes('code')) {
    //   let code=url.substr(url.indexOf('code=')+5,6);
    //   let state=url.substr(url.indexOf('state=')+6,6);
 
        var data={
        // 'code':code,
        // 'state':state,
        // 'grant_type':'authorization_code',
        // 'redirect_uri':redirect_uri
            'account':account,
            'password':password,
        };
    $.ajax({
       url: oauth_server+"/token/authorization",
       type:"post",
       data:data,
       async: false,
    //    contentType: 'application/x-www-form-urlencoded',
       dataType: "json",
       beforeSend:function(xhr){
        
        },
       success: function (sResponse) {
           if(sResponse.error_code == 200){
                saveAuth(sResponse.result);
                return ;
           }
           alert(sResponse.error_msg);return;
           
        // console.log('fetch_token ok: ' + sResponse.access_token+'  expires_in:'+sResponse.expires_in);
        //window.location.href = redirect_uri;
       },
       error:function(a,b,c){
        console.log(a, b, c);
       }
    });
    // }
}
 
function refreshToken(){
    var auth = getAuth();
    var data={
            'client_id': client_id,
            'client_secret': client_secret,
            'grant_type':'refresh_token',
            'refresh_token':auth.refresh_token
            };
        $.ajax({
           url: oauth_server+"/oauth/token",
           type:"post",
           data:data,
           async: false,
           contentType: 'application/x-www-form-urlencoded',
           success: function (sResponse) {
            saveAuth(sResponse);
            console.log('refresh_token ok: ' + sResponse.access_token+'  expires_in:'+sResponse.expires_in);
           },
           error:function(a,b,c){
            if (a.status==400 && a.responseJSON.error=='invalid_grant'){
                console.log('refresh token invalid');
                clearAuth();
            }
           }
        });
}
 
function checkToken(){
            $.ajax({
               url: oauth_server+"/oauth/check_token",
               type:"get",
               async: false,
               data: {'token': getAuth().access_token},
               contentType: 'application/x-www-form-urlencoded',
               success: function (sResponse) {
                console.log('check_token : ' + sResponse);
               },
               error:function(a,b,c){
                console.log(a.responseJSON);
               }
            });
}
 
function getServerdata(){
    $.get(oauth_server+"/msg", function(data) {
            $("#user").html(data);
          });
}
 
 
// $(function() {
    ajaxSetup();
// });