$(document).ready(() => {
  var socket = io()
  const CANVAS_ROWS = 1000
  const CANVAS_COLS = 1000

  var step = 1
      
  var canvas = $("#place")[0]  
  var cartCnt = 0  
  var cartList =""
  var tempPixel = []
  var ctx = canvas.getContext("2d")
  var widthCanvas
  var heightCanvas
  var canvasData = []
  var canvasImg = []

  var gridToggle = $('#grid-toggle')
  var gridShow = false
  
  var dragEnable = false
  var coordsShow = true

  var colorExpanded = false

  var currentColor = '#000000'

  // View parameters
  var xleftView = 0
  var ytopView = 0

  var countDownDate = 0

  function getColor(color) {
      if( color[0] == '#') {
          if( color.length == 7 ) {
              return parseInt(color.substr(1,6), 16)
          } else if( color.length == 4 ) {
              color = color[1] + color[1] + color[2] + color[2] + color[3] + color[3]
              val = parseInt(color, 16)            
              return val;
          }
      } else if( color.startsWith("rgb") ) {
          rgbVal = color.substr(4).split(",")
          return (parseInt(rgbVal[0]) << 16) + (parseInt(rgbVal[1]) << 8) + parseInt(rgbVal[2])
      }
  }

  function setCanvasColor(x, y, cr) { 
      idx = (y * widthCanvas + x) * 4
      canvasImg.data[idx] = (cr & 0xFF0000) >> 16
      canvasImg.data[idx+1] = (cr & 0xFF00) >> 8
      canvasImg.data[idx+2] =  cr & 0xFF
      canvasImg.data[idx+3] = 255
  }

  $( window ).resize( function() {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight    
    widthCanvas = canvas.clientWidth
    heightCanvas = canvas.clientHeight

    draw();
  });

  function counter(){
    setInterval(() => {  
        countDownDate
        now = new Date().getTime();
        distance = countDownDate - now;
        hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor((distance % (1000 * 60)) / 1000);
        str = hours+ ":" +minutes+ ":" +seconds
        $( "div.time" ).html(str)
      }, 1000);      
  }
  
  function initialize() {
      
      countDownDate = new Date("Dec 18, 2018 17:00:00").getTime()          

      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      widthCanvas = canvas.clientWidth
      heightCanvas = canvas.clientHeight
              
      xleftView = Math.round((widthCanvas - CANVAS_COLS) / 2)
      ytopView = Math.round((heightCanvas - CANVAS_ROWS) / 2)
      
      canvas.addEventListener("mousedown", handleMouseDown, false); 
      canvas.addEventListener("mousemove", handleMouseMove, false);
      canvas.addEventListener("mouseup", handleMouseUp, false);
      canvas.addEventListener("mouseout", handleMouseOut, false);
      canvas.addEventListener("click", handleMouseClick, false);      
     
      gridToggle.click(function() {
          gridShow = gridShow ? false : true
          if (gridShow) $(this).addClass('active');
          else $(this).removeClass('active')
          draw()
      });

      socket.on("canvas", data => {
          canvasData = data
          draw()
      })

      socket.on("canvasDot", data => {
        canvasData[data.row - 1][data.col - 1] = data.color;
        draw()
      })

      $("#submit").click(() => {
          socket.emit("color", {
              col: parseInt($("#x-coord").val()),
              row: parseInt($("#y-coord").val()),
              color: $("#color").val()
          })
      })

      $('#shopping_cart').click(() =>{
        if($('.cart_list').css('display')=="none")
        {   
            $('.cart_list').show('slow');
            // $('.cart_list').css("display","block")              
        }else if($('.cart_list').css('display')=="block"){   
            $('.cart_list').hide('slow');
            // $('.cart_list').css("display","none")           
        }           
      })        

      $('#arrow-up').click(() =>{               
          $('.cart_list').css('display','none');            
      })                    

      $('#trash').click(()=>{               
        cartList =""            
        for(i=0;i<=cartCnt;i++){    //cartCnt = 5,  i =1, 3     
            row = tempPixel[i*2+1] +1           //(1,2) (3,4)       
            col = tempPixel[i*2+2] +1       
            //currentColor = '#000000'           
            canvasData[col-1][row-1] = '#FFFFFF'            
            draw()  
        }       
        cartCnt = 0     
        $('.pixel_list').html(cartList)
        $('.count').html(cartCnt)        
        $('.pixelCnt').html(cartCnt)
        $('.trxCnt').html(cartCnt)
      })        

      $('#download').click(() => {          
          downloadImage()           
      })            

      $('#zoom-in').click(() => {     
          if(step<80){
              nCenterDotX = parseInt((widthCanvas / 2 - xleftView) / step + 1)
              nCenterDotY = parseInt((heightCanvas / 2 - ytopView) / step + 1)

              xleftView -= nCenterDotX; 
              ytopView -= nCenterDotY; 
                  
              step += 1
          }
          draw()            
      })

      $('#zoom-out').click(() => {
          if (step <= 2) {
              step = 1
              
              xleftView = Math.round((widthCanvas - CANVAS_COLS) / 2)
              ytopView = Math.round((heightCanvas - CANVAS_ROWS) / 2)               
          } else if( step > 2 ) {                
              nCenterDotX = parseInt((widthCanvas / 2 - xleftView) / step + 1)
              nCenterDotY = parseInt((heightCanvas / 2 - ytopView) / step + 1)
  
              xleftView += nCenterDotX;
              ytopView += nCenterDotY;                           

              step -= 1
          }
          draw()
      })

      $('#drag').click(() => {
          dragEnable = dragEnable ? false : true
          if (dragEnable) {
              coordsShow = false;
              $("#drag").addClass('active')
              $("#place").on("mouseover", function() {
                  $(this).css('cursor', 'grab');
              }).mouseout(function() {
                  $(this).css('cursor', 'auto');
              });
          } else {
              coordsShow = false;
              $("#drag").removeClass('active')
              $("#place").on("mouseover", function() {
                  $(this).css('cursor', 'url(data:image/x-icon;base64,AAACAAEAICAQAAAAAADoAgAAFgAAACgAAAAgAAAAQAAAAAEABAAAAAAAAAIAAAAAAAAAAAAAEAAAAAAAAAAAAAAAhYWFAPqv6ADgm4sASkpKAJ/l7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACIAAAAAAAAAAAAAAAAAAAEiIAAAAAAAAAAAAAAAAAAxEiIAAAAAAAAAAAAAAAADMxEgAAAAAAAAAAAAAAAAMzMxAAAAAAAAAAAAAAAAAzMzMAAAAAAAAAAAAAAAADMzMwAAAAAAAAAAAAAAAAMzMzAAAAAAAAAAAAAAAAAzMzMAAAAAAAAAAAAAAAADMzMwAAAAAAAAAAAAAAAABTMzAAAAAAAAAAAAAAAAAFVTMAAAAAAAAAAAAAAAAABFVQAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////////////////////////////////////////////////////////P////h////wP///4H///8D///+B////A////gf///wP///4H///+D////B////w////8///////////////w==), auto');
              }).mouseout(function() {
                  $(this).css('cursor', 'auto');
              });
          }
      })

      $('#color-picker').click(() => {
          if (colorExpanded) {
              $('.color-items').hide('slow')
              colorExpanded = false;
          } else {
              $('.color-items').show('slow')
              colorExpanded = true;
          }
      })

      $('.color-item').click(function() {
          var newColor = $(this).css('background-color')
          $('.color-pan').css('background-color', newColor)
          
          if(dragEnable)
              $('#drag').click()
          currentColor = newColor
      })

      $('.color-items').hide()
      $("#place").on("mouseover", function() { $(this).css('cursor', 'url(data:image/x-icon;base64,AAACAAEAICAQAAAAAADoAgAAFgAAACgAAAAgAAAAQAAAAAEABAAAAAAAAAIAAAAAAAAAAAAAEAAAAAAAAAAAAAAAhYWFAPqv6ADgm4sASkpKAJ/l7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACIAAAAAAAAAAAAAAAAAAAEiIAAAAAAAAAAAAAAAAAAxEiIAAAAAAAAAAAAAAAADMxEgAAAAAAAAAAAAAAAAMzMxAAAAAAAAAAAAAAAAAzMzMAAAAAAAAAAAAAAAADMzMwAAAAAAAAAAAAAAAAMzMzAAAAAAAAAAAAAAAAAzMzMAAAAAAAAAAAAAAAADMzMwAAAAAAAAAAAAAAAABTMzAAAAAAAAAAAAAAAAAFVTMAAAAAAAAAAAAAAAAABFVQAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///////////////////////////////////////////////////////////////////////////////////////P////h////wP///4H///8D///+B////A////gf///wP///4H///+D////B////w////8///////////////w==), auto'); }).mouseout(function() { $(this).css('cursor', 'auto'); });
  }

  function deleteItem(){           
    var id = $(this).attr('id')      
    $('#'+id).parent().parent().parent().remove()       
    id_num = id.substr(3,id.length-2) 
    var index = parseInt(id_num, 10)
    row = tempPixel[index*2-1] +1       
    col = tempPixel[index*2] +1     
    canvasData[col-1][row-1] = '#FFFFFF'
    draw()    
    cartCnt -=1
    if(cartCnt<0){cartCnt=0}
    $('.pixelCnt').html(cartCnt)
    $('.trxCnt').html((cartCnt)*10)
    $('.count').html(cartCnt)        
  }

  var mouseDown = false
  var mouseDrag = false

  function handleMouseDown(event) {
      mouseDown = true     
  }

  function handleMouseUp(event) {
      mouseDown = false
  }

  function handleMouseOut(event) {
      mouseDown = false
      mouseDrag = false
      isMouseIn = false
      $('.coord').css('display', 'none')
  }
  
  function handleMouseClick(event) {
      $('.cart_list').hide();
      if (dragEnable) return      
      var mousePos = getMousePos(canvas, event)
      xPos = Math.floor((mousePos.x - xleftView) / step);
      yPos = Math.floor((mousePos.y - ytopView) / step);
      $('#x-coord').val(xPos + 1)
      $('#y-coord').val(yPos + 1)
      if (mouseDrag) {
          mouseDrag = false;
          return;
      }
      
      var row = parseInt((mousePos.x - xleftView)/step)
      var col = parseInt((mousePos.y - ytopView)/step)          
      if(row >= 0 && row < CANVAS_ROWS && col >= 0 && col < CANVAS_COLS) {                       
          
        if(cartCnt<10)
            $('.count').css("width","10px")
        else
            $('.count').css("width","")      
        iscount = false
        if(tempPixel.length>1){
            for(i=0;i<tempPixel.length;i++){
                row1 = tempPixel[i*2+1]
                col1 = tempPixel[i*2+2]
                if(row1==NaN || col1==NaN){                    
                }else if((row1==row)&&(col1==col)){
                    iscount = true
                }
            }
        }
        if( (!iscount))
        {   
           tempPixel[cartCnt*2+1] = row;        
           tempPixel[cartCnt*2+2] = col;        
           cartCnt ++             
           $('.count').html(cartCnt)
           cartList ="<tr class='r01'> <br> <td id='d01'>&nbsp;" + (row+1) + " , " + (col+1) + "</td> <br>" +
                     "<td>10</td><br><td><button class='btn btn-default clr' type='button'><i class='fa fa-close close' id='del" + cartCnt +"'></i></button></td>"
            
           $("#t01 .pixel_list").append(cartList);                 
           
           $('.pixelCnt').html(cartCnt)
           $('.trxCnt').html(cartCnt*10)
           
           $('#del' + cartCnt).click(deleteItem);      
        }
      }

      canvasData[yPos][xPos] = currentColor
      draw() 

      socket.emit("color", {
          col: parseInt($("#x-coord").val()),
          row: parseInt($("#y-coord").val()),
          color: currentColor
      })
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
      if(X == oldX && Y == oldY && isMouseIn) {
        var mousePos = getMousePos(canvas,event)
        var row = parseInt((mousePos.x - xleftView)/step)
        var col = parseInt((mousePos.y - ytopView)/step)          
        if(row >= 0 && row < CANVAS_ROWS && col >= 0 && col < CANVAS_COLS) {                 
         
          str_coord = "(" + (row+1) + "," + (col+1) + ")"
          $('.coord_show').css('display','block')
          $('.txt').html(str_coord) 
        }else{
            $('.coord_show').css('display','none')
        }              
      }

      if (!dragEnable) {
          oldX = X;
          oldY = Y;
          $('.coord').css('display', 'none')        
          
          setTimeout(() => {
            if(X == oldX && Y == oldY && isMouseIn) {
              var mousePos = getMousePos(canvas,event)
              var row = parseInt((mousePos.x - xleftView)/step)
              var col = parseInt((mousePos.y - ytopView)/step)
              $(".coord-x").text(row + 1)
              $(".coord-y").text(col + 1)
              if(row >= 0 && row < CANVAS_ROWS && col >= 0 && col < CANVAS_COLS) {
                $('.coord').css('display', 'block')
                $(".coord-color").css('background-color', canvasData[col][row])
                
                var top = mousePos.y + 15
                var left = mousePos.x + 35
                if( mousePos.x > widthCanvas / 2 )
                    left = mousePos.x - 150
                if( mousePos.y > heightCanvas / 2 )
                    top = mousePos.y - 15 - 50
                $(".coord").css('top', top)
                $(".coord").css('left', left)              
              }              
            }
          }, 2000);
          return
      }
      
      if (mouseDown) {          
          $('.coord').css('display', 'none')

          var dx = (X - lastX);
          var dy = (Y - lastY);
          if (dx != 0 || dy != 0)
              mouseDrag = true;

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

  function getMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect()
      return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
      }
  }

  function draw() {       
      canvasImg = ctx.createImageData(widthCanvas, heightCanvas)

      xMax = CANVAS_COLS * step
      yMax = CANVAS_ROWS * step
      
      gridcr = getColor( "#DDD" )  
      xPos = xleftView        
      for (var i = 0; i < CANVAS_COLS; i++) {
          yPos = ytopView            
          if( xPos + step >= 0 && xPos < widthCanvas) {
              for (var j = 0; j < CANVAS_ROWS; j++) {
                  if( yPos + step >= 0 && yPos < heightCanvas) {
                      cr = getColor( canvasData[j][i] )    
                      nGrid = 0
                      if (gridShow == true && step >= 3) {
                          nGrid = 1
                      }                    
                      for(k = 0; k < step; k++) {
                          if( xPos + k >= 0 && xPos + k < widthCanvas ) {
                              for(m = 0; m < step; m++) {
                                  if( yPos + m >= 0 && yPos + m < heightCanvas) {
                                      if( nGrid == 1 && (k == 0 || m == 0) )
                                          setCanvasColor(xPos + k, yPos + m, gridcr)
                                      else 
                                          setCanvasColor(xPos + k, yPos + m, cr)
                                  }
                              }
                          }
                      }
                  }
                  yPos += step
              }
          }
          xPos += step
      }

       ctx.putImageData(canvasImg, 0, 0)
  }

  function downloadImage() {
      var image = canvas.toDataURL()

      var a = $("<a>")
          .attr("href", image)
          .attr("download", "img.png")
          .appendTo("body");

      a[0].click();

      a.remove();
  }

  var tableIndex = 1;
  $("#pay").click(function(event){
    event.preventDefault();
    var name = $('#add_community').val();
    if(name == ""){
        $('.alert').removeClass('hide')
    }else{
        $('.alert').addClass('hide')
        var iTag = "";
        if(tableIndex == 1) iTag = "<i class='fa fa-trophy' style='color: red;'></i>&nbsp;&nbsp;"
        $('#communities').append("<tr><td scope='row'>" + tableIndex + "</td><td>" + iTag + name + "</td><td>0</td><td>0</td></tr>");
        tableIndex++;
    }  
  });

  initialize()  
  counter()  
})    
