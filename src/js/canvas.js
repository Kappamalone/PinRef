const backgroundColor = "#2a2a2a";
const focusColor = "#168e99";

//TODO: scale these two values with the size of the browser maybe? + line thickness on border
const focusLineWeight = 4;
const focusCircleRadius = 12;

let started = false;
let links; //holds the original image links from the pinterest board

let drawItems = []; //List of all images to be drawn each frame
let alreadyDragging = false //Check if an image is currently being dragged
let isFocus = false; //Used to focus on most recently clicked image

/* FOR CANVAS
TODOS:
    -Delete images
    -Rotate images
    -Greyscale images (Will need something like a right click menu)
*/

//https://editor.p5js.org/enickles/sketches/H1n19TObz bless this link
class Item {
    constructor(image,x,y,xr,yd) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.xr = xr;
        this.yd = yd;
        this.originalWidth = this.xr - this.x;
        this.originalHeight = this.yd - this.y;
        this.offsetX = 0;
        this.offsetY = 0;
        this.dragging = false;
        this.scaleDragging = false;

        // (x,y) is the top left corner, (xr,yd) is the bottom right corner
    }

    draw(px,py) {
        if (this.dragging) {
            width = this.xr - this.x;
            height = this.yd -  this.y;
            this.x = px + this.offsetX;
            this.y = py + this.offsetY;
            this.xr = this.x + width;
            this.yd = this.y + height;
        }

        if (this.scaleDragging) {
            //https://stackoverflow.com/questions/22746605/change-origin-of-canvas-drawn-image I am eternally thankful for this SO response and demo
            if (this.scaleAnchor == "TL") {
                this.x = px;
                this.y = this.yd - (this.originalHeight * (this.xr - this.x) / this.originalWidth);
            } else if (this.scaleAnchor == "TR") {
                this.xr = px;
                this.y = this.yd - (this.originalHeight * (this.xr - this.x) / this.originalWidth);
            } else if (this.scaleAnchor == "BR") {
                this.xr = px;
                this.yd = this.y + (this.originalHeight * (this.xr - this.x) / this.originalWidth);
            } else if (this.scaleAnchor == "BL") {
                this.x = px;
                this.yd = this.y + (this.originalHeight * (this.xr - this.x) / this.originalWidth);
            }
        }

        drawingContext.drawImage(this.image,this.x,this.y,this.xr-this.x, this.yd-this.y);
    }

    pressed(px,py) {
        //For each of the four vertexes, if the mouse is within a radius of focusCircleRadius then
        //Instead of dragging image, it resizes it
        //TODO: only allow image resizing if focus
        if (dist(px,py,this.x,this.y) < focusCircleRadius) {
            this.scaleDragging = true;
            this.scaleAnchor = "TL";
            alreadyDragging = true;
            isFocus = true;
        } else if (dist(px,py,this.xr,this.y) < focusCircleRadius) {
            this.scaleDragging = true;
            this.scaleAnchor = "TR";
            alreadyDragging = true;
            isFocus = true;
        } else if (dist(px,py,this.xr,this.yd) < focusCircleRadius) {
            this.scaleDragging = true;
            this.scaleAnchor = "BR";
            alreadyDragging = true;
            isFocus = true;
        } else if (dist(px,py,this.x,this.yd) < focusCircleRadius) {
            this.scaleDragging = true;
            this.scaleAnchor = "BL";
            alreadyDragging = true;
            isFocus = true;
        } else if (px > this.x && px < this.xr && py > this.y && py < this.yd && !alreadyDragging ) { //clicked on image
            this.dragging = true;
            this.offsetX = this.x - px;
            this.offsetY = this.y - py;
            alreadyDragging = true; //prevent from dragging multiple items or from dragging and resizing overlapping items
            
            //Pushes the clicked drawItem to the start of the buffer to handle overlapping
            let temp = this;
            drawItems.splice(drawItems.indexOf(temp), 1);
            drawItems.unshift(temp);
            isFocus = true; //to draw border
        }
    }

    released() {
        this.dragging = false;
        this.scaleDragging = false;
        alreadyDragging = false;
    }
}

//HELPER FUNCTIONS===================================================

function load_image(src,x,y) {
    var image = new Image();
    image.onload = function(){
        drawItems.push(new Item(image,x,y,this.x + this.width,this.y + this.height));
    }
    image.src = src;
}

//p5.js functions=====================================================

function setup() {
    createCanvas(0,0); //Keep it invisible until user inputs board url
}

function draw() {
    if (!started) return;
    background(backgroundColor);

    //Draws all the images onto the canvas
    //Looped through in reverse since the last clicked image is the first draw item and so on
    for (let i = drawItems.length-1; i >= 0; i--){
        let d = drawItems[i];
        d.draw(mouseX,mouseY);
        //Update cursor to hint at image resizing
        if (dist(mouseX,mouseY,d.x,d.y) < focusCircleRadius && isFocus) {
            cursor('grab');
        } else if (dist(mouseX,mouseY,d.xr,d.y) < focusCircleRadius && isFocus) {
            cursor('grab');
        } else if (dist(mouseX,mouseY,d.xr,d.yd) < focusCircleRadius && isFocus) {
            cursor('grab');
        } else if (dist(mouseX,mouseY,d.x,d.yd) < focusCircleRadius && isFocus) {
            cursor('grab');
        } else {
            cursor(ARROW)
        }
    }

    if (isFocus){
        let drawItem = drawItems[0];

        //Draw the outline
        noFill();
        stroke(focusColor);
        strokeWeight(focusLineWeight);
        rect(drawItem.x,drawItem.y,drawItem.xr-drawItem.x,drawItem.yd-drawItem.y);

        //Draw the corner circles
        fill(focusColor)
        circle(drawItem.x,drawItem.y,focusCircleRadius);
        circle(drawItem.xr,drawItem.y,focusCircleRadius);
        circle(drawItem.x,drawItem.yd,focusCircleRadius);
        circle(drawItem.xr,drawItem.yd,focusCircleRadius);
    }
}

function mousePressed() {
    if (!started) return;
    isFocus = false;
    for (drawItem of drawItems) {
        drawItem.pressed(mouseX,mouseY);
    }
}

function mouseReleased() {
    if (!started) return;
    for (drawItem of drawItems) {
        drawItem.released();
    }
}

function windowResized() {
    if (!started) return;
    resizeCanvas(windowWidth, windowHeight);
    
}

//====================================================================
    