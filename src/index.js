// Sketch class
// holds data for a Sketch and provides rendering functionality

class Sketch {
  constructor(sketch) {
    this.width = sketch.width;
    this.height = sketch.height;
    this.image = this.parseString(sketch.data);
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
  render() {
    this.div = document.createElement("div");
    this.div.style = "position:absolute;top:100px;left:100px;";
    let pxw = 20;
    let pxh = 20;

    for( let i = 0; i < this.height; i++) {
      for( let j = 0; j < this.width; j++) {
        let pxDiv = document.createElement("div");
        pxDiv.id = ("" + i) + (" " + j);
        let color = "gray";
        if(this.image[i][j] === 1) {
          color = "black";
        }
        pxDiv.style = "position:absolute;width:"+pxw+"px;height:"+pxh+"px;top:"+(i*pxh)+"px;left:"+(j*pxw)+"px;background:"+color;
        this.div.append(pxDiv);
      }
    }

    return this.div;
  }

  // update this.div to reflect altered internal state
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
