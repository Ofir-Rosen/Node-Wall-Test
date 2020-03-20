var express = require ('express');
//require express, store it in app, and then use app to listen on port 3000
var app = express();
var server = app.listen(5000);

//host the files in the public folder on this server on port 3000
app.use(express.static('public'));
//static means the files are not changing

console.log("My socket server is running");


//require websockets library
var socket = require('socket.io');


//this will keep track of in/outputs
var io = socket(server);
//call the socket function, (the library) using the server on ::3000


//javascript works based off of events, sockets work the same way, messages, connection, and disconnect
io.sockets.on('connection', newConnection);

function newConnection(socket){
  console.log('new connection ' + socket.id);
  //if theres a message called MOUSE, trigger function mouseMsg.
  socket.on('mouse', mouseMsg);

  function mouseMsg(data){
    console.log(data);
    //when a mouse message comes in, broadcast that exact same message.
    socket.broadcast.emit('mouse', data);
  }
}
