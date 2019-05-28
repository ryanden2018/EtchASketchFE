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

  static pxw() { return 20; }

  static pxh() { return 20; }

  // make a string of zeros corresponding to an image of dimension (width,height)
  static zeroData(width,height) {
    let result = "";
    for(i=0; i<width*height; i++) {
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

    for( let i = 0; i < this.height; i++) {
      for( let j = 0; j < this.width; j++) {
        let pxDiv = document.createElement("div");
        pxDiv.id = ("" + i) + (" " + j);
        let color = Sketch.unsetColor();
        if(this.image[i][j] === 1) {
          color = Sketch.setColor();
        }
        pxDiv.style = "position:absolute;width:"+Sketch.pxw()+"px;height:"+Sketch.pxh()+"px;top:"+(i*Sketch.pxh())+"px;left:"+(j*Sketch.pxw())+"px;background:"+color;
        this.div.append(pxDiv);
      }
    }

    return this.div;
  }

  // update this.div to reflect altered internal state
  // warning: 
  update() {
  }
}


//////////////////////////////////////////////

// document load callback
document.addEventListener("DOMContentLoaded", e=>{
  // Testing Code
  let b = new Sketch( {width:5,height:5,data:"0000000111101011111100000"});
  document.body.append(b.render());
});
