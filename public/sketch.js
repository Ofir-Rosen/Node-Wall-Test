var socket;
var x;
var y;

//
var lastX;
var lastY;

//stored data of the last X and Y position coming from the data
var lastDataX;
var lastDataY;

// state of whether or not this is a new line
var nulled;
//sotred last value of the new line state above
var lastNull;
var c;

//number of colour options
var numColors = 6;

//array of potential colours, set up in constant names here, but can be hex codes too!
var colors = ["red", "00FF00", "blue", "yellow","cyan", "magenta"];
let slider;
let id;
let clients = [];


//foreground image variable
let foreground;

//gui.dat STUFF
let brushStroke;

let canvas;

let drop;


function BrushStroke(){
  this.brushWeight = 12
  this.colour = '#ffae23'; // CSS string
  this.aFF0000 = function(){c = colors[0];foldUp();}
  this.a00FF00 = function(){c = colors[1];foldUp();}
  this.blue = function(){c = colors[2];foldUp();}
  this.yellow = function(){c = colors[3];foldUp();}
  this.cyan = function(){c = colors[4];foldUp();}
  this.magenta = function(){c = colors[5];foldUp();}
}

let gui_col;
let colorFolder;
function setup() {
  // put setup code here
 //createCanvas(1920,1080);
  createCanvas(800,600);

  clients[0] = '0';
  background(0);
  smooth();
  socket= io.connect('http://localhost:3000');

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

  // GUI stuff
  gui_col = new dat.GUI();
  brushStroke = new BrushStroke();

  gui_col.add(brushStroke, 'brushWeight', 5,30);
  //gui_col.addColor(brushStroke,'colour');
  colorFolder = gui_col.addFolder('colour');
  colorFolder.add(brushStroke, 'aFF0000');
  colorFolder.add(brushStroke,'a00FF00');
  colorFolder.add(brushStroke,'blue');
  colorFolder.add(brushStroke,'yellow');
  colorFolder.add(brushStroke,'cyan');
  colorFolder.add(brushStroke,'magenta');

}
function foldUp(){
  colorFolder.close();
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
  strokeWeight(brushStroke.brushWeight);
  line(x,y,lastX,lastY);
  point(x,y);
  noFill();
  lastX = x;
  lastY = y;
  console.log('SENDING: ' + x + ' , ' + y + " , " + nulled + ' , ' + c.toString() + ' , ' + brushStroke.brushWeight + ' , ' + id);


//create object with the data in it
  var data = {
    x1: x,
    y1: y,
    n: nulled,
    col: c.toString(),
    weight: brushStroke.brushWeight,
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
  // for(var i = 0; i < width; i+=width/numColors){
  //   index++;
  //   if (index == 1) fill(255,0,0);
  //   if (index == 2) fill(0,255,0);
  //   if (index == 3) fill(0,0,255);
  //   if (index == 4) fill(255,255,0);
  //   if (index == 5) fill(0,255,255);
  //   if (index == 6) fill(255,0,255);
  //   stroke(255);
  //   strokeWeight(3);
  //   rect(i, height-50, width/numColors,50);
  // }
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
       ind = 0;
   }
    console.log(clients);
  stroke(data.col);
  strokeWeight(data.weight);
  if (data.n == 1) {
    lastDataX = null;
    lastDataY = null;
  }
  if (lastDataX == null){
    lastDataX = data.x1;
    lastDataY = data.y1;
  }
  line(data.x1,data.y1, lastDataX, lastDataY);
  point(data.x1, data.y1);
  lastDataX = data.x1;
  lastDataY = data.y1;
}
