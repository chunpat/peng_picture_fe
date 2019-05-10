$.ajax({
    type: "GET",
    url: "http://127.0.0.1:9510/File/getUpToken", 
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization",localStorage.getItem('authorization'));
      // request.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
     
      // request.setRequestHeader("Access-Control-Allow-Origin","*");
      // request.setRequestHeader("Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild");
      // request.setRequestHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
      // request.setRequestHeader("X-Powered-By",' 3.2.1')
      // request.setRequestHeader("Content-Type", "application/json;charset=utf-8");

    },
    success: function(res){
      console.log(res)
      if(res.error_code == 200){
        var token = res.result.uptoken;
        var domain = res.result.domain;
        var config = {
          useCdnDomain: true,
          disableStatisticsReport: false,
          retryCount: 6,
          region: res.result.region
        };
      }
      if(res.error_code == 400)
      {
          alert( res.error_msg);
          return ;
      }
       
  
      var putExtra = {
        fname: res.fname,
        params: {},
        mimeType: null
      };
      $(".nav-box")
        .find("a")
        .each(function(index) {
          $(this).on("click", function(e) {
            switch (e.target.name) {
              case "h5":
                uploadWithSDK(token, putExtra, config, domain);
                break;
              // case "expand":
              //   uploadWithOthers(token, putExtra, config, domain);
              //   break;
              // case "directForm":
              //   uploadWithForm(token, putExtra, config);
              //   break;
              default:
                "";
            }
          });
        });
      // imageControl(domain);
      uploadWithSDK(token, putExtra, config, domain);
  },
  error: function(res){
      console.log(res)
      alert(res.responseJSON.msg);
  }
})



