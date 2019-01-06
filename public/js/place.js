var global = {
  canvasData: []
};
$(document).ready(() => {
  var socket = io();
  const CANVAS_ROWS = 1000;
  const CANVAS_COLS = 1000;
  var firstTime = 0;
  var step = 1;

  var canvas = $("#place")[0];
  var cartCnt = 0;
  var cartList = "";
  var tempPixel = [];
  var ctx = canvas.getContext("2d");
  var widthCanvas;
  var heightCanvas;
  // var global.canvasData = []
  var canvasImg = [];

  window.oldPixels = []; //public it

  var gridToggle = $("#grid-toggle");
  var gridShow = false;

  var dragEnable = false;
  var coordsShow = true;

  var colorExpanded = false;

  var currentColor = "#000000";

  // View parameters
  var xleftView = 0;
  var ytopView = 0;

  var countDownDate = 0;

  function setCanvasColor(x, y, cr) {
    idx = (y * widthCanvas + x) * 4;
    canvasImg.data[idx] = (cr & 0xff0000) >> 16;
    canvasImg.data[idx + 1] = (cr & 0xff00) >> 8;
    canvasImg.data[idx + 2] = cr & 0xff;
    canvasImg.data[idx + 3] = 255;
  }

  $(window).resize(function() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    widthCanvas = canvas.clientWidth;
    heightCanvas = canvas.clientHeight;

    draw();
  });

  function counter() {
    setInterval(() => {
      var date = new Date().toLocaleString("en-US", {
        timeZone: "Europe/London"
      });
      countDownDate = new Date(date);
      //  countDownDate
      var i = 60;
      var h = 23 - countDownDate.getHours();
      if (h < 10) {
        h = "0" + h;
      }
      var m = 59 - countDownDate.getMinutes();
      if (m < 10) {
        m = "0" + m;
      }
      var s = countDownDate.getSeconds();
      s = i - s;
      if (s < 10) {
        s = "0" + s;
      }
      str = h + ":" + m + ":" + s;
      i++;
      $("div.time").html(str);
      $("#dividendCountDown").html(str);
    }, 1000);
  }

  function initialize() {
    // countDownDate = new Date().getTime()
    canvas.width = canvas.clientWidth;
    // canvas.height = 1000
    canvas.height = canvas.clientHeight;
    widthCanvas = canvas.clientWidth;
    // heightCanvas = 1000
    heightCanvas = canvas.clientHeight;

    xleftView = Math.round((widthCanvas - CANVAS_COLS) / 2);
    ytopView = Math.round((heightCanvas - CANVAS_ROWS) / 2);

    canvas.addEventListener("mousedown", handleMouseDown, false);
    canvas.addEventListener("mousemove", handleMouseMove, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    canvas.addEventListener("mouseout", handleMouseOut, false);
    canvas.addEventListener("click", handleMouseClick, false);

    gridToggle.click(function() {
      gridShow = gridShow ? false : true;
      if (gridShow) $(this).addClass("active");
      else $(this).removeClass("active");
      draw();
    });

    socket.on("canvas", data => {
      global.canvasData = data;
      draw();
    });

    socket.on("canvasDot", data => {
      global.canvasData[data.row - 1][data.col - 1] = data.color;
      draw();
    });

    $("#submit").click(() => {
      socket.emit("color", {
        col: parseInt($("#x-coord").val()),
        row: parseInt($("#y-coord").val()),
        color: $("#color").val()
      });
    });

    $("#shopping_cart").click(() => {
      if ($(".cart_list").css("display") == "none") {
        $(".cart_list").show("slow");
        // $('.cart_list').css("display","block")
      } else if ($(".cart_list").css("display") == "block") {
        $(".cart_list").hide("slow");
        // $('.cart_list').css("display","none")
      }
    });

    $("#arrow-up").click(() => {
      $(".cart_list").css("display", "none");
    });

    $("#trash").click(() => {
      oldPixels.forEach((pixel, index) => {
        var x = pixel.x;
        var y = pixel.y;
        var color = pixel.color;
        global.canvasData[y][x] = color;
        socket.emit("color", {
          row: y + 1,
          col: x + 1,
          color: color
        });
      });
      oldPixels = [];
      cartCnt = 0;
      draw();
      $(".pixel_list").html("");
      $(".count").html(cartCnt);
      $(".pixelCnt").html(cartCnt);
      $(".trxCnt").html(cartCnt);
      cart = [];
    });

    $("#download").click(() => {
      downloadImage();
    });

    $("#zoom-in").click(() => {
      if (step == 1) {
        // active grid
        $("#grid-toggle").addClass("active");
        gridShow = gridShow ? false : true;
        // draw()

        // zoom x10
        for (var i = 0; i < 10; i++) {
          nCenterDotX = parseInt((widthCanvas / 2 - xleftView) / step + 1);
          nCenterDotY = parseInt((heightCanvas / 2 - ytopView) / step + 1);

          xleftView -= nCenterDotX;
          ytopView -= nCenterDotY;

          step += 1;
        }
      }
      if (step < 80 && step > 1) {
        nCenterDotX = parseInt((widthCanvas / 2 - xleftView) / step + 1);
        nCenterDotY = parseInt((heightCanvas / 2 - ytopView) / step + 1);

        xleftView -= nCenterDotX;
        ytopView -= nCenterDotY;

        step += 1;
      }
      draw();
    });

    $("#zoom-out").click(() => {
      if (step <= 2) {
        step = 1;

        xleftView = Math.round((widthCanvas - CANVAS_COLS) / 2);
        ytopView = Math.round((heightCanvas - CANVAS_ROWS) / 2);
      } else if (step > 2) {
        nCenterDotX = parseInt((widthCanvas / 2 - xleftView) / step + 1);
        nCenterDotY = parseInt((heightCanvas / 2 - ytopView) / step + 1);

        xleftView += nCenterDotX;
        ytopView += nCenterDotY;

        step -= 1;
      }
      draw();
    });

    $("#drag").click(() => {
      dragEnable = dragEnable ? false : true;
      if (dragEnable) {
        coordsShow = false;
        $("#drag").addClass("active");
        $("#place")
          .on("mouseover", function() {
            $(this).css("cursor", "grab");
          })
          .mouseout(function() {
            $(this).css("cursor", "auto");
          });
      } else {
        coordsShow = false;
        $("#drag").removeClass("active");
        $("#place")
          .on("mouseover", function() {
            $(this).css(
              "cursor",
              "url(data:image/x-icon;base64,AAACAAEAICAQAAAAAADoAgAAFgAAACgAAAAgAAAAQAAAAAEABAAAAAAAAAIAAAAAAAAAAAAAEAAAAAAAAAAAAAAAhYWFAPqv6ADgm4sASkpKAJ/l7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACIAAAAAAAAAAAAAAAAAAAEiIAAAAAAAAAAAAAAAAAAxEiIAAAAAAAAAAAAAAAADMxEgAAAAAAAAAAAAAAAAMzMxAAAAAAAAAAAAAAAAAzMzMAAAAAAAAAAAAAAAADMzMwAAAAAAAAAAAAAAAAMzMzAAAAAAAAAAAAAAAAAzMzMAAAAAAAAAAAAAAAADMzMwAAAAAAAAAAAAAAAABTMzAAAAAAAAAAAAAAAAAFVTMAAAAAAAAAAAAAAAAABFVQAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////////////////////////////////////////////////////////P////h////wP///4H///8D///+B////A////gf///wP///4H///+D////B////w////8///////////////w==), auto"
            );
          })
          .mouseout(function() {
            $(this).css("cursor", "auto");
          });
      }
    });

    $("#color-picker").click(() => {
      if (colorExpanded) {
        $(".color-items").hide("slow");
        colorExpanded = false;
      } else {
        $(".color-items").show("slow");
        colorExpanded = true;
      }
    });

    $(".color-item").click(function() {
      var newColor = $(this).css("background-color");
      $(".color-pan").css("background-color", newColor);

      if (dragEnable) $("#drag").click();
      currentColor = newColor;
    });

    $(".color-items").hide();
    $("#place")
      .on("mouseover", function() {
        $(this).css(
          "cursor",
          "url(data:image/x-icon;base64,AAACAAEAICAQAAAAAADoAgAAFgAAACgAAAAgAAAAQAAAAAEABAAAAAAAAAIAAAAAAAAAAAAAEAAAAAAAAAAAAAAAhYWFAPqv6ADgm4sASkpKAJ/l7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACIAAAAAAAAAAAAAAAAAAAEiIAAAAAAAAAAAAAAAAAAxEiIAAAAAAAAAAAAAAAADMxEgAAAAAAAAAAAAAAAAMzMxAAAAAAAAAAAAAAAAAzMzMAAAAAAAAAAAAAAAADMzMwAAAAAAAAAAAAAAAAMzMzAAAAAAAAAAAAAAAAAzMzMAAAAAAAAAAAAAAAADMzMwAAAAAAAAAAAAAAAABTMzAAAAAAAAAAAAAAAAAFVTMAAAAAAAAAAAAAAAAABFVQAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////////////////////////////////////////////////////////P////h////wP///4H///8D///+B////A////gf///wP///4H///+D////B////w////8///////////////w==), auto"
        );
      })
      .mouseout(function() {
        $(this).css("cursor", "auto");
      });
  }

  var mouseDown = false;
  var mouseDrag = false;

  function handleMouseDown(event) {
    mouseDown = true;
  }

  function handleMouseUp(event) {
    mouseDown = false;
  }

  function handleMouseOut(event) {
    mouseDown = false;
    mouseDrag = false;
    isMouseIn = false;
    $(".coord").css("display", "none");
  }

  function handleMouseClick(event) {
    $(".cart_list").hide();
    if (dragEnable) return;
    var mousePos = getMousePos(canvas, event);
    xPos = Math.floor((mousePos.x - xleftView) / step);
    yPos = Math.floor((mousePos.y - ytopView) / step);
    $("#x-coord").val(xPos + 1);
    $("#y-coord").val(yPos + 1);
    if (mouseDrag) {
      mouseDrag = false;
      return;
    }

    if(oldPixels.length>=100){
 	showModalError(
        "uh-oh..",
        "You can not buy more than 100 pixel",
        ""
      );
 	return false;
    }
    var row = parseInt((mousePos.x - xleftView) / step);
    var col = parseInt((mousePos.y - ytopView) / step);

    var pixelIndex = -1;
    oldPixels.forEach((pixel, index) => {
      if (pixel.x == xPos + 1 && pixel.y == yPos + 1) pixelIndex = index;
    });
    if (pixelIndex >= 0) {
      return false;
    }

    if (row >= 0 && row < CANVAS_ROWS && col >= 0 && col < CANVAS_COLS) {
      cartCnt++;

      if (cartCnt < 10) $(".count").css("width", "10px");
      else $(".count").css("width", "");
      iscount = false;
      if (tempPixel.length > 1) {
        for (i = 0; i < tempPixel.length; i++) {
          row1 = tempPixel[i * 2 + 1];
          col1 = tempPixel[i * 2 + 2];
          if (row1 == NaN || col1 == NaN) {
          } else if (row1 == row && col1 == col) {
            iscount = true;
          }
        }
      }

      var newItem =
        "<tr id='item-" +
        oldPixels.length +
        "'><td>" +
        (xPos + 1) +
        " , " +
        (yPos + 1) +
        "</td><td>10</td><td><span class='btn btn-default clr'><i class='fa fa-close close deleteItem' id='del-item-" +
        oldPixels.length +
        "'></i></span></td></tr>";

      $(".pixel_list").append(newItem);
    }

    oldPixels.push({
      x: parseInt($("#x-coord").val()),
      y: parseInt($("#y-coord").val()),
      color: currentColor
    });

    $(".count").html(cartCnt);
    $(".trxCnt").html(cartCnt * 10);
    $(".pixelCnt").html(cartCnt);

    // }
    ///////
    //yPos = yPos - 1
    //xPos = xPos - 1
    global.canvasData[yPos][xPos] = currentColor;

    // global.canvasData[parseInt($('#x-coord').val())][parseInt($('#y-coord').val())] = currentColor
    draw();

    //console.log(oldPixels)

    console.log(
      parseInt($("#x-coord").val()),
      parseInt($("#x-coord").val()),
      currentColor
    );

    socket.emit("color", {
      col: parseInt($("#x-coord").val()),
      row: parseInt($("#y-coord").val()),
      color: currentColor
    });
  }
  function deleteItem(event) {
    event.preventDefault();
    var id = parseInt(
      $(this)
        .attr("id")
        .substr(9)
    );
    var x = oldPixels[id - 1].x;
    var y = oldPixels[id - 1].y;
    var color = oldPixels[id - 1].color;
    global.canvasData[y][x] = color;
    // draw()
    socket.emit("color", {
      row: y + 1,
      col: x + 1,
      color: color
    });
    cartCnt--;
    $("#item-" + id).remove();

    if (cartCnt < 0) {
      cartCnt = 0;
    }
    $(".pixelCnt").html(cartCnt);
    $(".trxCnt").html(cartCnt * 10);
    $(".count").html(cartCnt);
  }

  var isMouseIn = false;
  var lastX = 0;
  var lastY = 0;
  var curX = 0;
  var curY = 0;

  function handleMouseMove(event) {
    isMouseIn = true;
    var X = event.clientX - this.offsetLeft - this.clientLeft + this.scrollLeft;
    var Y = event.clientY - this.offsetTop - this.clientTop + this.scrollTop;

    oldX = X;
    oldY = Y;
    if (X == oldX && Y == oldY && isMouseIn) {
      var mousePos = getMousePos(canvas, event);
      var row = parseInt((mousePos.x - xleftView) / step);
      var col = parseInt((mousePos.y - ytopView) / step);
      if (row >= 0 && row < CANVAS_ROWS && col >= 0 && col < CANVAS_COLS) {
        str_coord = "(" + (row + 1) + "," + (col + 1) + ")";
        $(".coord_show").css("display", "block");
        $(".txt").html(str_coord);
      } else {
        $(".coord_show").css("display", "none");
      }
    }

    if (!dragEnable) {
      oldX = X;
      oldY = Y;
      $(".coord").css("display", "none");

      setTimeout(async () => {
        if (X == oldX && Y == oldY && isMouseIn) {
          var mousePos = getMousePos(canvas, event);
          var row = parseInt((mousePos.x - xleftView) / step);
          var col = parseInt((mousePos.y - ytopView) / step);
          var pixelX = row + 1;
          var pixelY = col + 1;
          // pixelX = pixelX.toString();
          // pixelY = pixelY.toString();
          // var pixelXY = StringToBytes('575,256');
          // let result = await TRON.viewPixelOwner('429,229');
          // console.log(pixelXY);
          // console.log(result);

          $(".coord-x").text(row + 1);
          $(".coord-y").text(col + 1);
          //console.log(tronWeb.address.toHex("TBBnsH1UJMMyjAKWQj3cKtfSmQzsDK78aN"))

          let tempPosition = new Uint16Array(2);
          tempPosition.set([pixelX, pixelY]);
          let position = new Uint8Array(tempPosition.buffer);
          let results = await TRON.viewPixelOwner(position);
          // console.log('pixelX = ' + pixelX + ' pixelY= ' + pixelY)
          // console.log(position);
          // console.log(results);
          if (results != 410000000000000000000000000000000000000000) {
            $(".coords-user").html(
              '<i class="fa fa-user"></i><span class="userAddress">' +
                tronWeb.address.fromHex(results) +
                "</span>"
            );
            $(".coord").addClass("coord-hover");
          } else {
            $(".coords-user").html("");
          }

          // var t = await TRON.PixelPurchased();
          // console.log(StringToBytes('576,256'));
          if (row >= 0 && row < CANVAS_ROWS && col >= 0 && col < CANVAS_COLS) {
            $(".coord").css("display", "block");
            $(".coord-color").css(
              "background-color",
              global.canvasData[col][row]
            );

            var top = mousePos.y + 30;
            var left = mousePos.x + 30;
            var bottom = mousePos.y + 30;
            var right = mousePos.y + 30;

            if (mousePos.y < 30) {
              $(".coord").css("top", top + 30);
            } else if (mousePos.y > heightCanvas - 76) {
              $(".coord").css("top", top - 76);
            } else {
              $(".coord").css("top", top);
            }

            if (mousePos.x < 30) {
              $(".coord").css("left", left + 30);
            } else if (mousePos.x > widthCanvas - 400) {
              $(".coord").css("left", left - 400);
            } else {
              $(".coord").css("left", left);
            }

            // if (mousePos.x > widthCanvas / 2) left = mousePos.x - 150
            // if (mousePos.y > heightCanvas / 2) top = mousePos.y - 15 - 50

            // $('.coord').css('top', top)
            // $('.coord').css('left', left)
          }
        }
      }, 2000);
      return;
    }

    if (mouseDown) {
      $(".coord").css("display", "none");

      var dx = X - lastX;
      var dy = Y - lastY;
      if (dx != 0 || dy != 0) mouseDrag = true;

      if (xleftView + dx > widthCanvas / 2) {
      } else if (xleftView + dx < -CANVAS_ROWS * step + widthCanvas / 2) {
      } else {
        xleftView += dx;
      }

      if (ytopView + dy > heightCanvas / 2) {
      } else if (ytopView + dy < -CANVAS_COLS * step + heightCanvas / 2) {
      } else {
        ytopView += dy;
      }

      draw();
    }
    lastX = X;
    lastY = Y;
  }

  $(document).on("click", ".deleteItem", function(event) {
    event.preventDefault();
    var id = parseInt(
      $(this)
        .attr("id")
        .substr(9)
    );
    // debugger;
    var x = oldPixels[id].x;
    var y = oldPixels[id].y;
    //var color = oldPixels[id].color
    var color = "#FFF";
    global.canvasData[y][x] = "#FFFFFF";

    oldPixels.splice(id, 1);
    socket.emit(
      "color",
      {
        row: y,
        col: x,
        color: color
      },
      false
    );
    cartCnt--;
    $(".pixel_list").html("");
    oldPixels.forEach((pixel, index) => {
      ///  if (pixel.x == xPos+1 && pixel.y == yPos+1) pixelIndex = index
      var newItem =
        "<tr id='item-" +
        index +
        "'><td>" +
        pixel.x +
        " , " +
        pixel.y +
        "</td><td>10</td><td><span class='btn btn-default clr'><i class='fa fa-close close deleteItem' id='del-item-" +
        index +
        "'></i></span></td></tr>";
      $(".pixel_list").append(newItem);
    });

    draw();

    if (cartCnt < 0) {
      cartCnt = 0;
    }
    $(".pixelCnt").html(cartCnt);
    $(".trxCnt").html(cartCnt * 10);
    $(".count").html(cartCnt);
  });
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  async function draw() {
  	if(firstTime==0){
    setTimeout(async function() {
      let ALLPixelDimensions = await TRON.viewALLPixelDimensions();
      let ALLPixelColors = await TRON.viewALLPixelColors();
      ALLPixelDimensions.forEach((item, index) => {
        let coordition = convertCoord(item.substr(2, 9));
        let colorArray = ALLPixelColors[index];
        let color = convertColor(colorArray.substr(2, 13));
        let x = coordition.x;
        let y = coordition.y;
        x = x - 1;
        y = y - 1;
        let r = color.r;
        let g = color.g;
        let b = color.b;
        let colorCode = rgbToHex(r, g, b);
        global.canvasData[y][x] = colorCode;
      });
      //draw()
    }, 3000);
    firstTime=1;
	}
	

    // let ALLPixelDimensions = TRON.viewALLPixelDimensions()
    // console.log(ALLPixelDimensions)
    //   let winTimestamp = '0';
    //   let winnerData = await tronWeb.getEventResult(TRON.CONTRACT_ADDRESS,'0', 'PickWinnerData');
    //   winnerData.forEach(item=>{
    //     winTimestamp = winnerData.timestamp
    //   })
    //  //console.log(winTimestamp);
    //  if(winTimestamp==0){
    //   winTimestamp = '1544498532000'
    // }

    // let results = await tronWeb.getEventResult(TRON.CONTRACT_ADDRESS, '1544498532000' ,'PixelPurchased');
    // results.forEach(item=>{
    //  let timestamp = item.result.timestamp
    //  if(timestamp>=winTimestamp){
    //    let buyer = item.result.buyer
    //    let colorArray = item.result.colorArray
    //    let pixelPositionArray = item.result.pixelPositionArray

    //            //console.log(convertCoord('1c02db0100000000000000000000000000000000000000000000000000000000'))
    //            let communityName = item.result.communityName

    //            let coordition = convertCoord(pixelPositionArray);

    //           // console.log(coordition)
    //           let color=convertColor(colorArray);
    //            //console.log(item)
    //            let x = coordition.x;
    //            let y = coordition.y;
    //            x = x - 1
    //            y = y - 1
    //            let r = color.r;
    //            let g = color.g;
    //            let b = color.b;
    //            let colorCode = rgbToHex(r,g,b)
    //           // debugger;
    //            //console.log('R = '+r+'G= '+ g + 'B= ' + b);
    //            //console.log(colorCode)
    //            global.canvasData[y][x] = colorCode

    //          }

    //        })
    //draw()

    //console.log('pixel' + global.canvasData[492][512]);

    canvasImg = ctx.createImageData(widthCanvas, heightCanvas);

    xMax = CANVAS_COLS * step;
    yMax = CANVAS_ROWS * step;

    gridcr = getColor("#DDD");
    xPos = xleftView;
    for (var i = 0; i < CANVAS_COLS; i++) {
      yPos = ytopView;
      if (xPos + step >= 0 && xPos < widthCanvas) {
        for (var j = 0; j < CANVAS_ROWS; j++) {
          if (yPos + step >= 0 && yPos < heightCanvas) {
            cr = getColor(global.canvasData[j][i]);
            nGrid = 0;
            if (gridShow == true && step >= 3) {
              nGrid = 1;
            }
            for (k = 0; k < step; k++) {
              if (xPos + k >= 0 && xPos + k < widthCanvas) {
                for (m = 0; m < step; m++) {
                  if (yPos + m >= 0 && yPos + m < heightCanvas) {
                    if (nGrid == 1 && (k == 0 || m == 0))
                      setCanvasColor(xPos + k, yPos + m, gridcr);
                    else setCanvasColor(xPos + k, yPos + m, cr);
                  }
                }
              }
            }
          }
          yPos += step;
        }
      }
      xPos += step;
    }

    ctx.putImageData(canvasImg, 0, 0);
  }

  function downloadImage() {
    var image = canvas.toDataURL();

    var a = $("<a>")
      .attr("href", image)
      .attr("download", "img.png")
      .appendTo("body");

    a[0].click();

    a.remove();
  }

  var tableIndex = 1;
  $("#pay").click(async function(event) {
    event.preventDefault();
    var name = $("#add_community").val();

    if (name == "") {
      $(".alert").removeClass("hide");
      $(".alert").html("Insert your name.");
      hidealert();
    } else if (hasWhiteSpace(name) == true) {
      $(".alert").html("Community name without Space");
      $(".alert").removeClass("hide");
      hidealert();
    } else {
      $(".alert").addClass("hide");
      var check1 = await TRON.viewCommunityExist(name);
      if (check1 == true) {
        $(".alert").html("Community name already exists");
        $(".alert").removeClass("hide");
        hidealert();
      } else {
        var result = await TRON.createNewCommunicty(name);
        $(".alert").addClass("hide");
        hidealert();
        $(".modal").modal("hide");
        $("#new_community").hide();
        showModalSuccess(
          "Hooray!",
          "Community " +
            name +
            ' created successfully. <br/>You can verify transaction below <a class="btn btn-success actBtn" target="_blank" href="https://shasta.tronscan.org/#/transaction/' +
            result +
            '">Go To Explorer</a><br/> <span class="cool">Ok cool, Lets own some pixels!</span>  ',
          ""
        );
        return false;
      }
    }
  });
  $("#buy_tokens").click(async function(event) {
    event.preventDefault();
    var value = $("#tokens_value").val();
    var test = await TRON.usertoCommunity();

    if (isEmpty(test) || hex2a(test) == "") {
      //alert('You must be Join 1 Community to Buy Pixels.');
      $(".alert").removeClass("hide");
      $(".alert").html("You must Join 1 Community to Buy Tokens.");
      hidealert();
      return false;
    } else {
      if (value < 100) {
        $(".alert").removeClass("hide");
        $(".alert").html("You cant buy less then 100 tokens.");
        hidealert();
      } else {
        var result = await TRON.buyTokens(value);
        $(".modal").modal("hide");
        showModalSuccess(
          "wow",
          'Tokens buying was successfull. <br/>You can verify transaction below <a class="btn btn-success actBtn" target="_blank" href="https://shasta.tronscan.org/#/transaction/' +
            result +
            '">Go To Explorer</a><br/> <span class="cool">Ok cool, Lets own some pixels!</span>  ',
          showAccountInfo
        );
      }
    }
  });
  $(".btn_buy").click(async function(event) {
    // $("#spinning-page").modal("show");

    var test = await TRON.usertoCommunity();
    if (isEmpty(test) || hex2a(test) == "") {
      // $("#spinning-page").modal("hide");
      //alert('You must be Join 1 Community to Buy Pixels.');
      showModalError(
        "uh-oh..",
        "You must Join any Community to Buy Pixels",
        ""
      );
      return false;
    } else {
      var result = await TRON.buyPixels(oldPixels);
      if (result) {
        // $("#spinning-page").modal("hide");
        showModalSuccess(
          "yay!!",
          'You have successfully claimed pixels. <br/>You can verify transaction below <a class="btn btn-success actBtn" target="_blank" href="https://shasta.tronscan.org/#/transaction/' +
            result +
            '">Go To Explorer</a><br/> <span class="cool">Ok cool, Lets have more fun!</span> ',
          showAccountInfo
        );
        EmptyCart();
        $(".cart_list").hide();
        return false;
      }
    }
  });
  function hidealert() {
    setTimeout(function() {
      $(".alert").addClass("hide");
    }, 4000);
  }
  function EmptyCart() {
    // oldPixels.forEach((pixel, index) => {
    //       var x = pixel.x
    //       var y = pixel.y
    //       var color = pixel.color
    //       global.canvasData[y][x] = color
    //       socket.emit('color', {
    //         row: y + 1,
    //         col: x + 1,
    //         color: color
    //       })
    //     })
    oldPixels = [];
    cartCnt = 0;
    //draw()
    $(".pixel_list").html("");
    $(".count").html(cartCnt);
    $(".pixelCnt").html(cartCnt);
    $(".trxCnt").html(cartCnt);
    cart = [];
  }

  $("#btn_join").click(async function(event) {
    var name = $("#listCommunity").val();
    var joinCommunityResult = await TRON.joinCommunity(name);
    $(".modal").modal("hide");
    showModalSuccess(
      "Yew!!",
      "You Have successfully Joined Community",
      showAccountInfo
    );
    $("#LeaveCommunityDiv").show();
    $(".communityData").show();
    $("#JoinCommunityDiv").hide();

    return false;
  });
  $("#btn_leave").click(async function(event) {
    var result = await TRON.leaveCommunity();
    $(".modal").modal("hide");
    showModalSuccess(
      "Success",
      'You Left Community. check transaction here <a class="btn btn-success actBtn" target="_blank" href="https://shasta.tronscan.org/#/transaction/' +
        result +
        '">tronscan.org</a> ',
      showAccountInfo
    );
    $("#LeaveCommunityDiv").hide();
    $(".communityData").hide();
    $("#JoinCommunityDiv").show();
    showAccountInfo();
  });
  initialize();
  counter();
  setTimeout(tronLoginCheck, 2000);
  //Try to set handle address change event
  let intervalID = setInterval(function() {
    if (typeof window.tronWeb == "object") {
      window.tronWeb.on("addressChanged", showAccountInfo);
      clearInterval(intervalID);
    }
  }, 10);
  //Try to get realtime balance
  setInterval(function() {
    if (typeof window.tronWeb == "object") {
      showAccountInfo();
    }
  }, 1000);
  async function tronLoginCheck() {
    try {
      if (!window.tronWeb) throw "You must install tronlink extension";
      if (!(window.tronWeb && window.tronWeb.ready))
        throw "Login to Tronlink to get going";
      $("#loading-page").modal("show");
      setTimeout(function() {
        $("#loading-page").modal("hide");
        showAccountInfo();
      }, 1000);
    } catch (e) {
      showModal("Stop", e, tronLoginCheck);
    }
  }
  async function showAccountInfo() {
    $("#account-address").text(tronWeb.defaultAddress.base58);
    // $('#account-address').val(tronWeb.defaultAddress.base58);
    $("#account-balance").text(
      (await tronWeb.trx.getBalance(tronWeb.defaultAddress.hex)) / 1000000
    );
    // $('#account-balance').val((await tronWeb.trx.getBalance(tronWeb.defaultAddress.hex)).toLocaleString("en-us"));
    var test = await TRON.usertoCommunity();

    if (isEmpty(test) || hex2a(test) == "") {
      $("#LeaveCommunityDiv").hide();
      $(".communityData").hide();
    } else {
      $("#currentCommunity").val(hex2a(test));
      $("#JoinCommunityDiv").hide();
    }
  }
  function showModal(title, content, callback) {
    $("#alert-title").text(title);
    $("#alert-content").html(content);
    $("#alert-modal").modal("show");
    $("#alert-modal").on("hidden.bs.modal", function(e) {
      callback();
    });
  }

  function showModalSuccess(title, content, callback) {
    $("#alert-title-success").text(title);
    $("#alert-content-success").html(content);
    $("#alert-modal-success").modal("show");
    $("#alert-modal-success").on("hidden.bs.modal", function(e) {
      callback();
    });
  }

  function showModalError(title, content, callback) {
    $("#alert-title-error").text(title);
    $("#alert-content-error").html(content);
    $("#alert-modal-error").modal("show");
    $("#alert-modal-error").on("hidden.bs.modal", function(e) {
      callback();
    });
  }
  // setTimeout( async function (){
  //    let results = await tronWeb.getEventResult(TRON.CONTRACT_ADDRESS, '1544498532000','PixelPurchased');
  //      results.forEach(item=>{
  //        let buyer = item.result.buyer
  //        let colorArray = item.result.colorArray
  //        let pixelPositionArray = item.result.pixelPositionArray
  //        let communityName = item.result.communityName
  //        let coordition = convertCoord(pixelPositionArray.toString());
  //        let color=convertColor(colorArray.toString());
  //        let x = coordition.x;
  //        let y = coordition.y;
  //        let r = color.r;
  //        let g = color.g;
  //        let b = color.b;
  //        let colorCode = rgbToHex(r,g,b)
  //        //console.log('R = '+r+'G= '+ g + 'B= ' + b);
  //       // console.log(colorCode)
  //        //global.canvasData[y][x] = colorCode
  //        //draw()
  //      })

  //  }, 40000)
});
var http = require("http");
setInterval(function() {
  http.get("https://abplace.herokuapp.com");
}, 100000); // every 5 minutes (300000)
