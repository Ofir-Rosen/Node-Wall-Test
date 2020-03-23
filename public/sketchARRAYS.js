var socket;
var x;
var y;
var lastX;
var lastY;
var lastDataX =[];
var lastDataY =[];
var nulled;
var lastNull;
var c;
var numColors = 6;
var colors = ["red", "green", "blue", "yellow","cyan", "magenta"];
let slider;
let id;
let clients = [];
let lastDat= [];



function setup() {
  // put setup code here
  //createCanvas(1920,1080);
  createCanvas(800,600);
  clients[0] = '0';
  lastDataX[0] = 0;
  lastDataY[0] = 0;
  let d = createDiv();
  d.style('transform: rotate(' + 90 + 'deg);');
  d.position(-100,80);
  slider = createSlider(3,50,12);
  slider.style('width', '200px');
  d.child(slider);
  background(0);
  smooth();
  //socket= io.connect('192.168.1.16:3000');
  socket = io.connect("https://wall-test-001.herokuapp.com/");
  lastDat[0] = null;
  //on connect Event
  socket.on('connect', () => {
      //get the id from socket
      id = socket.id;
      console.log(id);

  });
  //if this socket recieves a message, run newDrawing
  socket.on('mouse', newDrawing);

  nulled = 1;
  lastNull = 0;
  c = "black";
}

function touchStarted(){
  nulled = 1;
  var index;
  for(var i = 0; i < numColors; i++){
    if(mouseX > width/numColors*i && mouseX < width/numColors*(i+1) && mouseY < height && mouseY > height-50) c = colors[i];
  }
}
function mouseDragged(){
  if (nulled == 1 && lastNull==nulled) nulled = 0;
  x = mouseX;
  y = mouseY;
  if (lastX == null){
    lastX = x;
    lastY = y;
    //nulled = 1;
  }
  //fill(255);
  //noStroke();

  stroke(c);
  strokeWeight(slider.value());
  line(x,y,lastX,lastY);
  point(x,y);
  noFill();
  lastX = x;
  lastY = y;
  console.log('SENDING: ' + x + ' , ' + y + " , " + nulled + ' , ' + c.toString() + ' , ' + slider.value() + ' , ' + id);


//create object with the data in it
  var data = {
    x1: x,
    y1: y,
    n: nulled,
    col: c.toString(),
    weight: slider.value(),
    id: id
  }
//emit the data packet
  socket.emit('mouse',data);
  lastNull = nulled;
  //ellipse(mouseX,mouseY,20,20);
}

function mouseReleased(){
  lastX = null;
  lastY = null;
  nulled = 1;
}
function draw() {
  fill(0);
  noStroke();
  rect(0,0,70,300);
  let index = 0;
  // put drawing code here
  for(var i = 0; i < width; i+=width/numColors){
    index++;
    if (index == 1) fill(255,0,0);
    if (index == 2) fill(0,255,0);
    if (index == 3) fill(0,0,255);
    if (index == 4) fill(255,255,0);
    if (index == 5) fill(0,255,255);
    if (index == 6) fill(255,0,255);
    stroke(255);
    strokeWeight(3);
    rect(i, height-50, width/numColors,50);
  }
}
function newDrawing(data){
  //console.log(data.id);
  var ind = 0;
  for(var i = 0; i < clients.length; i++){
    if(data.id != clients[i]){
    ind +=1;
    console.log('index = ' +ind);
    }
  }
    if(ind >= clients.length){
       clients.push(data.id);
       lastDat.push(data);
       ind = 0;
   }
    console.log(clients);
    console.log(lastDat);
  for(var i = 1; i <clients.length; i++){
    if(data.id == clients[i]){
    lastDat[i] = data;
    stroke(lastDat[i].col);
    strokeWeight(lastDat[i].weight);
    if (lastDat[i].n == 1) {
      lastDataX[i] = null;
      lastDataY[i] = null;
    }
    if (lastDataX[i] == null){
      lastDataX[i] = lastDat[i].x1;
      lastDataY[i] = lastDat[i].y1;
    }
    line(lastDat[i].x1,lastDat[i].y1, lastDataX[i], lastDataY[i]);
    point(data.x1, lastDat[i].y1);
    lastDataX[i] = lastDat[i].x1;
    lastDataY[i] = lastDat[i].y1;
  }
}
}
