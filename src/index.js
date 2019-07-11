// Sketch class
// holds data for a Sketch and provides rendering functionality

class Sketch {
  // initialize a fresh object
  constructor(sketch) {
    this.width = sketch.width;
    this.height = sketch.height;
    this.image = this.parseString(sketch.data);
    this.pointerX = sketch.pointerX;
    this.pointerY = sketch.pointerY;

    this.canvas = document.querySelector("#es");
    this.context = this.canvas.getContext('2d');
    this.imgdata = this.context.createImageData(Sketch.pxw()*this.width, Sketch.pxh()*this.height)
    this.context.fillStyle="#FF0000";
    this.context.fillRect(0,0,954,684);
  }

  // reset the object to the properties of given sketch
  resetData(sketch) {
    this.width = sketch.width;
    this.height = sketch.height;
    this.image = this.parseString(sketch.data);
    this.pointerX = sketch.pointerX;
    this.pointerY = sketch.pointerY;
  }
  static pxw() { return 2; }

  static pxh() { return 2; }

  // return object which can be persisted to database
  generateData() {
    return {width:this.width, height:this.height, pointerX:this.pointerX, pointerY:this.pointerY, data:this.generateString() };
  }

  // make a string of zeros corresponding to an image of dimension (width,height)
  static zeroData(width,height) {
    let result = "";
    for(var i=0; i<width*height; i++) {
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
    for(let i=0; i<Sketch.pxh()*this.height; i++) {
      for(let j= 0; j < Sketch.pxw()*this.width; j++) {
        let idx0 = (i*Sketch.pxw()*this.width+j)*4;
        let val;
        if( this.image[Math.floor(i/Sketch.pxh())][Math.floor(j/Sketch.pxw())] === 1) {
          val = 0;
        } else {
          val = 128;
        }
        this.imgdata.data[idx0] = val;
        this.imgdata.data[idx0+1] = val;
        this.imgdata.data[idx0+2] = val;
        this.imgdata.data[idx0+3] = 255;
      }
    }
    this.context.putImageData(this.imgdata,65,65);
  }

  // update this.div to reflect altered internal state
  update() {
    for(let i=0; i<Sketch.pxh()*this.height; i++) {
      for(let j= 0; j < Sketch.pxw()*this.width; j++) {
        let idx0 = (i*Sketch.pxw()*this.width+j)*4;
        let val;
        if( this.image[Math.floor(i/Sketch.pxh())][Math.floor(j/Sketch.pxw())] === 1) {
          val = 0;
        } else {
          val = 128;
        }
        this.imgdata.data[idx0] = val;
        this.imgdata.data[idx0+1] = val;
        this.imgdata.data[idx0+2] = val;
        this.imgdata.data[idx0+3] = 255;
      }
    }
    this.context.putImageData(this.imgdata,65,65);
  }


  // increment/decrement pointer X position
  incrementX() {
    this.image[this.pointerY][this.pointerX] = 1;
    this.update();
    this.pointerX = Math.min(this.pointerX+1,this.width-1);
  }
  decrementX() {
    this.image[this.pointerY][this.pointerX] = 1;
    this.update();
    this.pointerX = Math.max(this.pointerX-1,0);
  }

  // increment/decrement pointer Y position
  incrementY() {
    this.image[this.pointerY][this.pointerX] = 1;
    this.update();
    this.pointerY = Math.min(this.pointerY+1,this.height-1);
  }
  decrementY() {
    this.image[this.pointerY][this.pointerX] = 1;
    this.update();
    this.pointerY = Math.max(this.pointerY-1,0);
  }
}



//////////////////////////////////////////////
// fetches
//////////////////////////////////////////////

// load sketch given by sketch id
function getSketch(sketchId) {
  return fetch(`${baseUrl}/sketches/${sketchId}`)
  .then( res => res.json() )
  .then( data => {pageSketch.resetData(data);pageSketch.update();} );
}

// save current sketch to user_id (post)
function postSketch(userId) {
  return fetch(`${baseUrl}/sketches`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json',
              'Accept': 'application/json' },
    body: JSON.stringify( Object.assign(pageSketch.generateData(),{user_id:userId}) )
  })
}

// save current sketch to sketch_id (patch)
function patchSketch(sketchId) {
  return fetch(`${baseUrl}/sketches/${sketchId}`, {
    method:'PATCH',
    headers:{'Content-Type':'application/json',
            'Accept':'application/json' },
    body: JSON.stringify( pageSketch.generateData() )
  });
}

// delete current sketch
function deleteSketch(sketchId) {
  return fetch(`${baseUrl}/sketches/${sketchId}`, { method:"DELETE" });
}


//////////////////////////////////////////////
// globals
//////////////////////////////////////////////

let pageSketch;
let keycodes = {};
const baseUrl = "http://localhost:3000/api/v1"
//const baseUrl = "https://intense-island-31073.herokuapp.com/api/v1/sketches"
let epsilon = 0.01;
let curUserId = null;

const width = 412;
const height = 277;

//////////////////////////////////////////////
// document-level event listeners
//////////////////////////////////////////////

document.addEventListener('keydown', e=>{
  if(document.activeElement.tagName !== "INPUT") {
    e.preventDefault();
    keycodes[e.code] = 1;
    for( code in keycodes) {
      switch(code) {
        case 'ArrowUp':
        case 'KeyW':
          pageSketch.decrementY();
          break;
        case 'ArrowDown':
        case 'KeyS':
          pageSketch.incrementY();
          break;
        case 'ArrowLeft':
        case 'KeyA':
          pageSketch.decrementX();
          break;
        case 'ArrowRight':
        case 'KeyD':
          pageSketch.incrementX();
          break;
      }
    }
  }
});

document.addEventListener('keyup',e=>{
  e.preventDefault();
  delete keycodes[e.code];
});

function renderSketchesDropdown(userId) {
  fetch(`${baseUrl}/users/${userId}`).then(res=>res.json())
  .then(data=> {
    let sketchesDropdownDiv = document.querySelector("#sketchesDropdown")
    sketchesDropdownDiv.innerHTML = "";
    let sketchesDropdown = document.createElement("select");
    sketchesDropdownDiv.append(sketchesDropdown);
    let newChoice = document.createElement("option");
    newChoice.innerText = "New";
    newChoice.value = "new";
    sketchesDropdown.append(newChoice);
    data.sketches.forEach( sketch => {
      let choice = document.createElement("option");
      choice.innerText = sketch.id;
      choice.value = sketch.id;
      sketchesDropdown.append(choice);
    });

    sketchesDropdown.addEventListener("change", e=>{
      e.preventDefault();
      if(e.target.value === "new") {
        pageSketch.resetData(
          {width:width,height:height,data:Sketch.zeroData(width,height),
            pointerX:Math.round(width/2), pointerY:Math.round(height/2)}
        );
        pageSketch.update();
      } else {
        getSketch(parseInt(e.target.value));
      }
    });
  });
}

let updateButton = document.querySelector("#updateButton");
updateButton.addEventListener("click",e=>{
  let sketchesDropdown = document.querySelector("#sketchesDropdown").children[0];
  if(sketchesDropdown.value === "new") {
    postSketch(curUserId).then(data=>renderSketchesDropdown(curUserId));
  } else {
    let id = parseInt(sketchesDropdown.value);
    patchSketch(id);
  }
});

let deleteButton = document.querySelector("#deleteButton");
deleteButton.addEventListener("click",e=>{
  let sketchesDropdown = document.querySelector("#sketchesDropdown").children[0];
  if(!(sketchesDropdown.value === "new")) {
    let id = parseInt(sketchesDropdown.value);
    deleteSketch(id).then( data=>renderSketchesDropdown(curUserId));

  }
  pageSketch.resetData({width:width,height:height,data:Sketch.zeroData(width,height),
    pointerX:Math.round(width/2), pointerY:Math.round(height/2)});
  pageSketch.update();
});

let deleteUserButton = document.querySelector("#deleteUserButton");
deleteUserButton.addEventListener("click",e=>{
  fetch(`${baseUrl}/users/${curUserId}`,{method:"DELETE"}).then(res=>{
    setTimeout(getUsers,3000);
  });
  curUserId = null;
  document.querySelector("#sketchesDropdown").innerHTML = "";
});

let userCreateButton = document.querySelector("#userCreateButton");
userCreateButton.addEventListener("click", e=>{
  e.preventDefault();
  let username = document.querySelector("#userCreate").value;
  document.querySelector("#userCreate").value = "";
  fetch(`${baseUrl}/users`, {method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username:username}) })
  .then( res =>  setTimeout( getUsers, 3000 ) );
  document.querySelector("#sketchesDropdown").innerHTML = "";
});

function getUsers() {
    // fetch and display users---------------------------------------
    let allUsers
    let dropDownMenu = document.querySelector('.dropdown-menu')
    dropDownMenu.innerHTML = '';
    let dropMenu=document.querySelector('#dropdownMenuButton')
    dropMenu.innerHTML = 'Select a User';
    fetch(`${baseUrl}/users`).then(res=>res.json()).then(obj=>{
      allUsers = obj
      allUsers.forEach(user=>{
        dropDownMenu.innerHTML = dropDownMenu.innerHTML + `<a class="dropdown-item" href="#" data-id="${user.id}">${user.username}</a>`
        
           // dropdown menu interactions--------------------------------------
        let allAs = document.querySelectorAll('a')
        allAs.forEach(a=>{
        a.addEventListener("click",function(e){
        e.preventDefault()
        curUserId = parseInt(e.target.getAttribute("data-id"));
        renderSketchesDropdown(e.target.getAttribute("data-id"))
        dropMenu.innerText=e.target.innerText
         
       })
     })
        
      })
    })
}


document.addEventListener("DOMContentLoaded", e=>{

  pageSketch = new Sketch( {width:width,height:height,data:Sketch.zeroData(width,height),
      pointerX:Math.round(width/2), pointerY:Math.round(height/2)});

  
  pageSketch.render()

  getUsers();
// DOMContentLoaded--------------------------------------------------------------
});


document.getElementById("deleteButton").addEventListener("mousedown",function(e){
  document.getElementById("es").classList.add("shake");
})

document.getElementById("deleteButton").addEventListener("mouseup",function(e){
  document.getElementById("es").classList.remove("shake");
})