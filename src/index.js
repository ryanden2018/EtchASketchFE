// Sketch class
// holds data for a Sketch and provides rendering functionality

class Sketch {
  constructor(sketch) {
    this.width = sketch.width;
    this.height = sketch.height;
    this.image = this.parseString(sketch.data);
  }

  static unsetColor() { return "grey"; }

  static setColor() { return "black"; }

  static pxw() { return 2; }

  static pxh() { return 2; }

  static pixelStyleString(i,j,color) {
    return `position:absolute;width:${Sketch.pxw()}px;height:${Sketch.pxh()}px;top:${i*Sketch.pxh()}px;left:${j*Sketch.pxw()}px;background:${color}`;
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
    this.div.style = `position:absolute;width:${this.width*Sketch.pxw()}px;height:${this.height*Sketch.pxh()}px;background:${Sketch.unsetColor()};`;

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
    }
  }
}


//////////////////////////////////////////////

// document load callback
document.addEventListener("DOMContentLoaded", e=>{
  // Testing Code
  let width = 412;
  let height = 277;
  let b = new Sketch( {width:width,height:height,data:Sketch.zeroData(width,height)});
  document.body.append(b.render());
  for(let i=0; i<height; i++) {
    for(let j=0; j<width; j++) {
      if(i === j) {
        b.image[i][j] = 1;
      }
    }
  }
  b.update();
  for(let i=0; i<height; i++) {
    for(let j=0; j<width; j++) {
      if((i === j) && (i > 100)) {
        b.image[i][j] = 0;
      }
      if(i === 200-j) {
        b.image[i][j] = 1;
      }
    }
  }
  b.update();
  for(let i=0; i<height; i++) {
    for(let j=0; j<width; j++) {
      if((i === j) && (i > 150)) {
        b.image[i][j] = 1;
      }
    }
  }
  b.update();
});
