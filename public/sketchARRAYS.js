
//the socket is what we're using to transmit the data to the server
//I don't know the details of how sockets work, but for simplicity's sake
//think of it as a direct line to our server, with it's own unique ID
var socket;

//current x and y position
var x;
var y;

//stored last X and Y position of THIS instanc eof the code
var lastX;
var lastY;

//stored data of the last X and Y position coming from the data, the
// =[] turns this into an array of data, meaning we can store multiple
//sets of data in one variable - I'm using arrays for all incoming
//data to keep things clean
var lastDataX =[];
var lastDataY =[];

// state of whether or not this is a new line
var nulled;
//sotred last value of the new line state above
var lastNull;

// variable for the colour we're currently drawing with
var c;

//number of available colours, this is basically just for mathing out how
//to space out the boxes at the bottom
var numColors = 6;
//array of potential colours, set up in constant names here, but can be hex codes too!
var colors = ["red", "green", "blue", "yellow","cyan", "magenta"];

//the slider on the left side,
let slider;

//this instance of the code's socket ID
let id;

//array of other connected clients, this is how we're going to check where the
//incoming data is coming from
let clients = [];
//array storing the incoming data, this is so we can separate it based off the
//incoming ID
let lastDat= [];




//setup() code runs ONCE as the code is launched
function setup() {
  //createCanvas sets up our drawing space, but in general for this language + library
  //(javascript + p5.js), the canvas is what holds everything we're creating, it doesn't need to abide by HTML's weird formatting, you can just place things at coordinates.

  createCanvas(1920,1080);

//  FOR TESTING - smaller canvas
//  createCanvas(800,600);

  // set the first client to some garbage, just so when we call it it doesn't come up as undefined
  clients[0] = '0';

  //since we set the first index of the clients array to garbage we have to burn
  //these first objects too. the index for for all of the arrays involving the data
  //are tied together, so clients[1] is the ID of lastDat[1], which contains the info
  //for lastDataX[1] and lastDataY[1]
  lastDataX[0] = 0;
  lastDataY[0] = 0;
  lastDat[0] = null;

  //this is just the code to set up our slider.
  //a Div (createDiv) is an HTML object for layouts, we just need this to rotate the slider
  let d = createDiv();
  d.style('transform: rotate(' + 90 + 'deg);');
  d.position(-100,80);
  //create a slider, that goes from vlaues 3, to 50, and defaults to 12
  slider = createSlider(3,50,12);
  slider.style('width', '200px');
  d.child(slider);
  background(0);
  smooth();
  //FOR TESTING - socket= io.connect('192.168.1.16:3000');

  //connect the socket to the server
  socket = io.connect("https://wall-test-001.herokuapp.com/");
  //on connection - grab this socket's unique ID and store it
  socket.on('connect', () => {
      //get the id from socket
      id = socket.id;
      console.log(id);

  });
  //if this socket recieves a message called 'mouse', run the function
  //in this document called newDrawing
  socket.on('mouse', newDrawing);
  //set some defaults ¯\_(ツ)_/¯
  nulled = 1;
  lastNull = 0;
  c = "black";
}

//any time a touch action is started - this could be as you tap your screen, or as you click the mouse. Runs once per click/touch
function touchStarted(){
  //reset to a new line.
  nulled = 1;
  var index;
  //check if our touch is selecting a colour, (this flips through an array,
  //with a loop using for(...)) basically, a for loop runs until the condition in the middle is met.
  //in this case, the variable i starts at 0, and goes up by 1 every time it loops
  //before it starts a new loop it checks if i is less than the ammount of colours we've set, and then decides whether or not to run again.
    for(var i = 0; i < numColors; i++){
    if(mouseX > width/numColors*i && mouseX < width/numColors*(i+1) && mouseY < height && mouseY > height-50) c = colors[i];
  }
}

//mouse dragged runs every frame that the mouse is held down.
function mouseDragged(){

  //if the new line variable is set to 0, set it to 0, so that the rest of these points connect
  if (nulled == 1 && lastNull==nulled) nulled = 0;

  //put our mouse positions in variables
  x = mouseX;
  y = mouseY;

  if (lastX == null){
    lastX = x;
    lastY = y;
    //nulled = 1;
  }

// set the colour of our line (stroke(...)), & the thickeness to the value of the slider, (strokeWeight(...))
//then make sure the sketch doesn't try to fill in the space between out lines. (noFill())
  stroke(c);
  noFill();
  strokeWeight(slider.value());
  //THIS IS THE DRAWING PART!
  //Create a line between our current X & Y positions, and out Stored X & Y. also draw a pint at the end of the line, this just cleans it up.
  line(x,y,lastX,lastY);
  point(x,y);
  //store our current X & Y for the next frame to use.
  lastX = x;
  lastY = y;
  //debugging stuff.
  console.log('SENDING: ' + x + ' , ' + y + " , " + nulled + ' , ' + c.toString() + ' , ' + slider.value() + ' , ' + id);


//create object with the data we're sending in it (x, y, new line state, colour, thickness, and this instance's ID)
  var data = {
    x1: x,
    y1: y,
    n: nulled,
    col: c.toString(),
    weight: slider.value(),
    id: id
  }

//send the data to the server, and name it 'mouse'.
  socket.emit('mouse',data);

  //store the current new line value, for the next frame.
  lastNull = nulled;
}

function mouseReleased(){
  //when you let go of the mouse button, set your last x and y to null, and turn the new line variable to 1
  lastX = null;
  lastY = null;
  nulled = 1;
}

// function() draw runs every frame, we're usually running at 60fps, for this runs 60 times  a second.
function draw() {
  //draw a black rectangle behind the slider, so that we don't get random shit behind it.
  fill(0);
  noStroke();
  rect(0,0,70,300);

  //draw the coloured boxes at the bottom.
  let index = 0;
  //this is a slightly weirder for loop, basically it sets i to 0, and adds
  //the width of the canvas divided by the number of colours every frame
  //finally, it loops until i is bigger than the width of the screen.
  //this means that this runs as many times as the number of colours
  //and gives us a clean varriable to start the positions of our next box
  for(var i = 0; i < width; i+=width/numColors){
    index++;
    //every loop, the variable I called index, rises by 1, so every loop, set
    //the fill of our boxes, to the colours we set above.
                                // V shitty way of doing this that I did before
                                    // if (index == 1) fill(255,0,0);
                                    // if (index == 2) fill(0,255,0);
                                    // if (index == 3) fill(0,0,255);
                                    // if (index == 4) fill(255,255,0);
                                    // if (index == 5) fill(0,255,255);
                                    // if (index == 6) fill(255,0,255);
    fill(colors[index]);
    stroke(255);
    strokeWeight(3);
    //draw a box, at x position i, y of the height-50px,
    //the valuse of the width of the canvas divided by the number of colours pixels wide
    //and 50px tall.
    rect(i, height-50, width/numColors,50);
  }
}

function newDrawing(data){
  //console.log(data.id);
  var ind = 0;
  //loop through the client ID list.
  for(var i = 0; i < clients.length; i++){
    //if the ID of the data coming in doesn't match the ID we're looking at
    if(data.id != clients[i]){
      //add one to a variable we created above,
    ind +=1;
    console.log('index = ' +ind);
    }
  }
  //if that variable is equal to the number of  clients connected
  //(since that index goes up by 1 every time it doesnt match the current ID)
    if(ind >= clients.length){
      //add the current ID to the array of IDs and add the current data onto the end of the array of Data objects.
       clients.push(data.id);
       lastDat.push(data);
       //reset that variable so we have a clean value next time.
       ind = 0;
   }
   //debugging shit.
    console.log(clients);
    console.log(lastDat);

    //loop through our clients again. - this loop just makes sure the right Data
    //stays paired with the right ID,
    //remember out ID is the same index in it's array, as its data is in all the other arrays.
  for(var i = 1; i <clients.length; i++){
    //check that the data's ID matches the one were looking at before basically running that same code from mouse dragged, but using the incoming data.
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
