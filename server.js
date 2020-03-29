var express = require ('express');
//require express, store it in app, and then use app to listen on port 3000
var app = express();
//var server = app.listen(3000);
var server = app.listen(process.env.PORT || 3000)
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
let activeClientLimit = 3;

function dequeue(arr, ID){
  for(var i = 0 ; i < arr.length ; i++){
    if(arr[i] == ID){
       arr.splice(i,1);
       console.log( arr[i] + ' , ' + ID);
     } else if (i == arr.length-1) {
       console.log('failed');
     }
  }
  return(arr);
}

function newConnection(socket){
     const sessionID = socket.id;
     queue.push(sessionID);
     console.log(queue);
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
      socket.on('disconnect', function(){queue = dequeue(queue,socket.id); console.log('disconnected 1: - ' + queue);});

      socket.on('amIActive', checkActivity);

  function mouseMsg(data){
    //Log the incoming Data DEBUGGING STUFF
    console.log(data);
    //when a mouse message comes in, broadcast that exact same message to ALL other connections.

    for(var i = 0; i < activeClientLimit; i++){
      if(sessionID == queue[i]){
        socket.broadcast.emit('mouse', data, sessionID);
        captureData.push(data);
      }
    }

  }


  function clearAll(data){
      socket.broadcast.emit('clear', data);
      console.log(data);
      captureData = [];

  }
  function sendScreenBack(data){
    for(var i = 0; i < captureData.length; i++){
      socket.emit('mouse', captureData[i]);
    }
  }
  function newCon(){
    socket.broadcast.emit('pushImage');
    console.log('push');
  }

  function checkActivity(){
    var activeData = {
      state: null,
      place: null
    }
    for(var i = 0; i < queue.length; i++){
      if(i < activeClientLimit){
        if(queue[i] == socket.id){
          activeData.state = true
          activeData.place = i-(activeClientLimit-1);
        }
      } else if (i >= activeClientLimit && queue[i] == socket.id) {
        activeData.state = false
        activeData.place = i-(activeClientLimit-1);
      }
    }
    socket.emit('active', activeData);
  }
}
