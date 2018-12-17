const express = require('express'),
      app = express(),
      server = require('http').createServer(app),
      io = require('socket.io')(server)

// Define the number of cols/rows for the canvas
const CANVAS_ROWS = 1000
const CANVAS_COLS = 1000
console.log(Date()+' sucsessfully loaded librarys and variables');
var canvas = [ ]
function resetCanvas() {
  // Create the canvas object so we can store its state locally
  canvas = [ ]
  
  // Populate the canvas with initial values
  
  for(var row = 0; row < CANVAS_ROWS; row++){
    canvas[row] = [ ]
    
    for(var col = 0; col < CANVAS_COLS; col++){
      canvas[row][col] = "#FFF"
    }
  }
}

resetCanvas()

console.log(Date()+' sucsessfully created blank canvas');
// Make our `public` folder accessible
app.use(express.static("public"))
console.log(Date()+' started server');
// Listen for connections from socket.io clients
io.on("connection", socket => {
  // Send the entire canvas to the user when they connect
  socket.emit("canvas", canvas)

  // This is fired when the client places a color on the canvas
  console.log(Date()+' user connected');
  socket.on("color", data => {
    // First we validate that the position on the canvas exists
    if(data.row <= CANVAS_ROWS && data.row > 0 && data.col <= CANVAS_COLS && data.col > 0){
      if (data.row === 1000 && data.col === 1000 && data.color === "#cc1177") {
		  resetCanvas()
	  } else {
      // Update the canvas
      canvas[data.row - 1][data.col - 1] = data.color
      // Send the new canvas to all connected clients
      }
      io.emit("canvasDot", {
        row: data.row,
        col: data.col,
        color: data.color
      })
      console.log(Date()+" user sent pixel with color "+data.color+", X: "+data.col+", Y: "+data.row+", sent it to everyone else");
      
    }
  })
})

// Start listening for connections
server.listen(process.env.PORT || 54325)
console.log(Date()+' Sucsessfully started listening on Port 54325');
