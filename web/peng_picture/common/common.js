var BLOCK_SIZE = 4 * 1024 * 1024;
var pageCount = 10;
    page = 1;
    maxPage = 1;
getImages(page,pageCount);
function addUploadBoard(file, config, key, type) {
  var count = Math.ceil(file.size / BLOCK_SIZE);
  var board = widget.add("tr", {
    data: { num: count, name: key, size: (file.size / (1024 * 1024)).toFixed(2) + 'M' },
    node: $("#fsUploadProgress" + type)
  });
  if (file.size > 100 * 1024 * 1024) {
    $(board).html("本实例最大上传文件100M");
    return "";
  }
  count > 1 && type != "3"
    ? ""
    : $(board)
        .find(".resume")
        .addClass("hide");
  return board;
}

function createXHR() {
  var xmlhttp = {};
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  return xmlhttp;
}

function getBoardWidth(board) {
  var total_width = $(board)
    .find("#totalBar")
    .outerWidth();
  $(board)
    .find(".fragment-group")
    .removeClass("hide");
  var child_width = $(board)
    .find(".fragment-group li")
    .children("#childBar")
    .outerWidth();
  $(board)
    .find(".fragment-group")
    .addClass("hide");
  return { totalWidth: total_width, childWidth: child_width };
}

function controlTabDisplay(type) {
  switch (type) {
    case "sdk":
      document.getElementById("box2").className = "";
      document.getElementById("box").className = "hide";
      break;
    case "others":
      document.getElementById("box2").className = "hide";
      document.getElementById("box").className = "";
      break;
    case "form":
      document.getElementById("box").className = "hide";
      document.getElementById("box2").className = "hide";
      break;
  }
}

var getRotate = function(url) {
  if (!url) {
    return 0;
  }
  var arr = url.split("/");
  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i] === "rotate") {
      return parseInt(arr[i + 1], 10);
    }
  }
  return 0;
};

function imageControl(domain) {
  $(".modal-body")
    .find(".buttonList a")
    .on("click", function() {
      var img = document.getElementById("imgContainer").getElementsByTagName("img")[0]
      var oldUrl = img.src;
      var key = img.key;
      var originHeight = img.h;
      var fopArr = [];
      var rotate = getRotate(oldUrl);
      if (!$(this).hasClass("no-disable-click")) {
        $(this)
          .addClass("disabled")
          .siblings()
          .removeClass("disabled");
        if ($(this).data("imagemogr") !== "no-rotate") {
          fopArr.push({
            fop: "imageMogr2",
            "auto-orient": true,
            strip: true,
            rotate: rotate
          });
        }
      } else {
        $(this)
          .siblings()
          .removeClass("disabled");
        var imageMogr = $(this).data("imagemogr");
        if (imageMogr === "left") {
          rotate = rotate - 90 < 0 ? rotate + 270 : rotate - 90;
        } else if (imageMogr === "right") {
          rotate = rotate + 90 > 360 ? rotate - 270 : rotate + 90;
        }
        fopArr.push({
          fop: "imageMogr2",
          "auto-orient": true,
          strip: true,
          rotate: rotate
        });
      }
      $(".modal-body")
        .find("a.disabled")
        .each(function() {
          var watermark = $(this).data("watermark");
          var imageView = $(this).data("imageview");
          var imageMogr = $(this).data("imagemogr");

          if (watermark) {
            fopArr.push({
              fop: "watermark",
              mode: 1,
              image: "http://www.b1.qiniudn.com/images/logo-2.png",
              dissolve: 100,
              gravity: watermark,
              dx: 100,
              dy: 100
            });
          }
          if (imageView) {
            var height;
            switch (imageView) {
              case "large":
                height = originHeight;
                break;
              case "middle":
                height = originHeight * 0.5;
                break;
              case "small":
                height = originHeight * 0.1;
                break;
              default:
                height = originHeight;
                break;
            }
            fopArr.push({
              fop: "imageView2",
              mode: 3,
              h: parseInt(height, 10),
              q: 100
            });
          }

          if (imageMogr === "no-rotate") {
            fopArr.push({
              fop: "imageMogr2",
              "auto-orient": true,
              strip: true,
              rotate: 0
            });
          }
        });
      var newUrl = qiniu.pipeline(fopArr, key, domain);

      var newImg = new Image();
      img.src = "images/loading.gif"
      newImg.onload = function() {
        img.src = newUrl
        document.getElementById("imgContainer").href = newUrl
      };
      newImg.src = newUrl;
      return false;
    });
}

function imageDeal(board, key, domain , style_separator) {
  var fopArr = [];
  //var img = $(".modal-body").find(".display img");
  var img = document.getElementById("imgContainer").getElementsByTagName("img")[0];
  img.key = key
  // fopArr.push({
  //   fop: "watermark",
  //   mode: 1,
  //   image: "http://www.b1.qiniudn.com/images/logo-2.png",
  //   dissolve: 100,
  //   gravity: "NorthWest",
  //   ws: 0.8,
  //   dx: 100,
  //   dy: 100
  // });
  fopArr.push({
    fop: "imageView2",
    mode: 2,
    h: 450,
    q: 100
  });
  var newUrl = qiniu.pipeline(fopArr, key, domain);
  $(board)
    .find(".wraper a")
    .html(
      '<img src="' +
        domain +
        "/" +
        key +
        style_separator +
        "watermark" +
        '"/>'
    );
  // var newImg = new Image();
  // img.src = "images/loading.gif"
  // newImg.onload = function() {
  //   img.src = newUrl
  //   img.h = 450
  //   document.getElementById("imgContainer").href = newUrl
  // };
  // newImg.src = newUrl;
}

//获取我的图片列表
function getImages(pageParam,count) {
  if(pageParam == -1){
    pageParam = page - 1 != 0 ? page - 1 : 1;
  }else if(pageParam == 999){
    pageParam = page + 1 > maxPage ? maxPage : page + 1;
  }
  page = pageParam
  $.ajax({
    type: "GET",
    url: "http://127.0.0.1:9510/File/index?page=" + pageParam + '&count=' + count, 
    dataType: "json",
    // beforeSend: function(request) {
    //   request.setRequestHeader("Authorization",localStorage.getItem('authorization'));
    // },
    success: function(res){
      console.log(res)
      if(res.error_code == 200){
        //整理渲染
        // jquery的each循环
        let list = res.result.list
        let myImages = ''; 
        let pagination = '';
        $.each(list, function() {
          myImages +=
            '<tr><td><div class="wraper"><a class="linkViewWrapper"><img src="' +
            this.url + res.result.style_separator + 'watermark' +
            '"></a></div></td><td>' + 
            this.catalog + 
            '</td><td><div style="overflow:hidden"><div id="totalBar" style="float:left;width:80%;height:30px;border:1px solid;border-radius:3px" class="hide">' +
            '<div id="totalBarColor" style="width: 100%; border: 0px; background-color: rgba(232, 152, 39, 0.8); height: 28px;"></div>' +
            '<p class="speed">进度：100% </p></div><div class="control-container">' + 
            this.url + res.result.style_separator + 'watermark' +
            '</td></tr>';
        });

        $('#myImageContent').html(myImages)
        pagination += 
         '<li><a href="javascript:;"' +
         'onclick = getImages(' + 
          -1 + 
          ',' +
          pageCount +
          ')' +
          ' aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
        maxPage =  Math.ceil(res.result.total/pageCount);
        for(let i=1;i <=maxPage;i++){
            let active = i == page ? 'active':'';
            pagination += 
            '<li class="' + 
            active +
            '"><a href="javascript:;" ' + 
            'onclick = getImages(' + 
            i + 
            ',' +
            pageCount +
            ')' +
            '>' +
            i +
            '</a></li>';
        }
        pagination += 
          '<li><a href="javascript:;" ' +
          'onclick = getImages(' + 
          999 + 
          ',' +
          pageCount +
          ')' +
          ' aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
        console.log(pagination)
        $('.pagination').html(pagination);
        
      }
      if(res.error_code == 400)
      {
          alert( res.error_msg);
          return ;
      }
       

  },
  error: function(res){
    alert('数据接口请求错误');
  }
  })
}

