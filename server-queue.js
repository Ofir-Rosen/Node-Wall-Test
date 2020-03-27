var express = require ('express');
//require express, store it in app, and then use app to listen on port 3000
var app = express();
var server = app.listen(3000);
//var server = app.listen(process.env.PORT || 3000)
//host the files in the public folder on this server on port 3000
app.use(express.static('public'));
//static means the files are not changing

console.log("My socket server is running");


//require websockets library
var socket = require('socket.io');


//this will keep track of in/outputs
var io = socket(server);
//call the socket function, (the library) using the server on ::3000

//javascript works based off of events, sockets work the same way, messages, connection, and disconnect are status messages it sends on its own.
io.sockets.on('connection', newConnection);

var sendBack;
let captureData = [];
let queue = [];
let disc = 0;

function newConnection(socket){
     const sessionID = socket.id;
     queue.push(sessionID);
     //log the incomming connections ID, DEBUGGING STUFF
     console.log('new connection ' + sessionID);
    for(var i = 0; i < captureData.length; i ++){
     socket.emit('mouse', captureData[i]);
   }
     socket.on('pushImage', newCon);
     sendBack = sessionID;
     socket.on('screen', sendScreenBack);
  //if theres a message called MOUSE, trigger function mouseMsg.
    socket.on('mouse', mouseMsg);

    socket.on('clear', clearAll);
    socket.on('disconnect', function(){disc++; console.log(disc);});
    let active = false;


  function mouseMsg(data){
    //Log the incoming Data DEBUGGING STUFF
    for(var i = 0; i < 2+disc; i ++){
      if(queue[i] == socket.id) {
          active = true;
      }
    }
      if(active){
        console.log(data);
    //when a mouse message comes in, broadcast that exact same message to ALL other connections.
        socket.emit('active', active);
        socket.broadcast.emit('mouse', data, sessionID);
        captureData.push(data);
      } else {
        socket.emit('active', active);
      }
      console.log(socket.id + '||' + active);
    }

  function clearAll(data){
      socket.broadcast.emit('clear', data);
      console.log(data);
      captureData = [];

  }
  function sendScreenBack(data){
    socket.emit('mouse', captureData[i]);
  }
  function newCon(){
    socket.broadcast.emit('pushImage');
    console.log('push');
  }
}