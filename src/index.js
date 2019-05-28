// Sketch class
// holds data for a Sketch and provides rendering functionality

class Sketch {
  constructor(sketch) {
    this.width = sketch.width;
    this.height = sketch.height;
    this.image = this.parseString(sketch.data);
    this.pointerX = sketch.pointerX;
    this.pointerY = sketch.pointerY;
  }

  static unsetColor() { return "grey"; }

  static setColor() { return "black"; }

  static pxw() { return 2; }

  static pxh() { return 2; }

  static pixelStyleString(i,j,color) {
    return `position:absolute;width:${Sketch.pxw()}px;height:${Sketch.pxh()}px;top:${i*Sketch.pxh()}px;left:${j*Sketch.pxw()}px;background:${color}`;
  }

  // return object which can be persisted to database
  generateData() {
    return {width:this.width, height:this.height, pointerX:this.pointerX, pointerY:this.pointerY, data:this.generateString() };
  }

  // make a string of zeros corresponding to an image of dimension (width,height)
  static zeroData(width,height) {
    let result = "";
    for(let i=0; i<width*height; i++) {
      result += "0";
    }
    return result;
  }

  // create image representation from string data
  parseString(data) {
    let results = []
    for( let i=0; i < this.height; i++) {
      results.push([]);
      for( let j= 0; j < this.width; j++) {
        results[i].push(parseInt(data[i*this.width+j]));
      }
    }
    return results;
  }

  // create string representation from image data
  generateString() {
    let str = "";
    for( let i=0; i < this.height; i++) {
      for( let j = 0; j < this.width; j++) {
        str += this.image[i][j];
      }
    }
    return str;
  }



  // return a div containing representation of the image data
  // this should only be called once, see update()
  render() {
    this.div = document.createElement("div");
    this.div.style = `position:relative;width:${this.width*Sketch.pxw()}px;height:${this.height*Sketch.pxh()}px;background:${Sketch.unsetColor()};`;

    for( let i = 0; i < this.height; i++) {
      for( let j = 0; j < this.width; j++) {
        if(this.image[i][j] === 1) {
          let pxDiv = document.createElement("div");
          pxDiv.id = `p${i}_${j}`;
          pxDiv.style = Sketch.pixelStyleString(i,j,Sketch.setColor());
          this.div.append(pxDiv);
        }
      }
    }
    return this.div;
  }

  // update this.div to reflect altered internal state
  update() {
    for(let i=0; i<this.height; i++) {
      for(let j=0; j<this.width; j++) {
        this.updatePixel(i,j);
      }
    }
  }

  // update the rendering of pixel at (i,j)
  updatePixel(i,j) {
    let pxDiv = document.querySelector(`#p${i}_${j}`);
    if(pxDiv && (this.image[i][j] === 0)) {
      pxDiv.style = `display:none;`;
    } else if(pxDiv && (this.image[i][j] === 1)) {
      pxDiv.style = Sketch.pixelStyleString(i,j,Sketch.setColor());
    } else { // pxDiv is null
      if(this.image[i][j] === 1) {
        pxDiv = document.createElement("div");
        pxDiv.id = `p${i}_${j}`;
        pxDiv.style = Sketch.pixelStyleString(i,j,Sketch.setColor());
        this.div.append(pxDiv);
      }
    }
  }

  // increment/decrement pointer X position
  incrementX() {
    this.image[this.pointerY][this.pointerX] = 1;
    this.updatePixel(this.pointerY,this.pointerX);
    this.pointerX = Math.min(this.pointerX+1,this.width-1);
  }
  decrementX() {
    this.image[this.pointerY][this.pointerX] = 1;
    this.updatePixel(this.pointerY,this.pointerX);
    this.pointerX = Math.max(this.pointerX-1,0);
  }

  // increment/decrement pointer Y position
  incrementY() {
    this.image[this.pointerY][this.pointerX] = 1;
    this.updatePixel(this.pointerY,this.pointerX);
    this.pointerY = Math.min(this.pointerY+1,this.height-1);
  }
  decrementY() {
    this.image[this.pointerY][this.pointerX] = 1;
    this.updatePixel(this.pointerY,this.pointerX);
    this.pointerY = Math.max(this.pointerY-1,0);
  }
}


//////////////////////////////////////////////

let sketch;

let keycodes = {};

document.addEventListener('keydown', e=>{
  keycodes[e.code] = 1;
  for( code in keycodes) {
    switch(code) {
      case 'ArrowUp':
      case 'KeyW':
        sketch.decrementY();
        break;
      case 'ArrowDown':
      case 'KeyS':
        sketch.incrementY();
        break;
      case 'ArrowLeft':
      case 'KeyA':
        sketch.decrementX();
        break;
      case 'ArrowRight':
      case 'KeyD':
        sketch.incrementX();
        break;
    }
  }
});

document.addEventListener('keyup',e=>{
  delete keycodes[e.code];
});

// document load callback
document.addEventListener("DOMContentLoaded", e=>{
  let width = 412;
  let height = 277;
  sketch = new Sketch( {width:width,height:height,data:Sketch.zeroData(width,height),
      pointerX:Math.round(width/2), pointerY:Math.round(height/2)});
  document.body.append(sketch.render());
});
