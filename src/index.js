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
  }

  // reset the object to the properties of given sketch
  resetData(sketch) {
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
    this.div = document.createElement("div");
    this.div.style = `position:relative;width:${this.width*Sketch.pxw()}px;height:${this.height*Sketch.pxh()}px;background:${Sketch.unsetColor()};`;
    this.div.id="gd"
    
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
let knob;
let knob2;
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
          knob2.value -= epsilon;
          break;
        case 'ArrowDown':
        case 'KeyS':
          pageSketch.incrementY();
          knob2.value += epsilon;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          pageSketch.decrementX();
          knob.value -= epsilon;
          break;
        case 'ArrowRight':
        case 'KeyD':
          pageSketch.incrementX();
          knob.value += epsilon;
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
    sketchesDropdownDiv.innerHTML = "";//FIXME
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


  let knobVal = 0.0;
  let knob2Val = 0.0;

  pageSketch = new Sketch( {width:width,height:height,data:Sketch.zeroData(width,height),
      pointerX:Math.round(width/2), pointerY:Math.round(height/2)});
  let gridDiv = document.getElementById('grid')

  
  let resziedRender = pageSketch.render()
  resziedRender.style.width = `${(parseInt(resziedRender.style.width.split("px")[0])+130)}px`
  resziedRender.style.height = `${(parseInt(resziedRender.style.height.split("px")[0])+130)}px`
  
  knob=document.createElement('x-knob')
  knob2=document.createElement('x-knob')
  knob.style="position:absolute; right:-3rem; top:31rem;z-index:1;"
  knob.setAttribute("class","big")

  knob2.style="position:absolute; left:-3rem; top:31rem;z-index:1;"
  knob2.setAttribute("class","big")

  knob.addEventListener("input", e=>{
    if(e.target.value-knobVal > epsilon) {
      pageSketch.incrementX();
      knobVal = e.target.value;
    } else if(knobVal-e.target.value > epsilon) {
      pageSketch.decrementX();
      knobVal = e.target.value;
    }
  });

  knob2.addEventListener("input", e=>{
    if(e.target.value-knob2Val > epsilon){
      pageSketch.incrementY();
      knob2Val = e.target.value;
    } else if(knob2Val-e.target.value > epsilon) {
      pageSketch.decrementY();
      knob2Val = e.target.value;
    }
  });
  
  resziedRender.append(knob)
  resziedRender.append(knob2)
  
  
   gridDiv.append(resziedRender);
   
   

   

  
  getUsers();
  
  

 
  
   
// DOMContentLoaded--------------------------------------------------------------
});


document.getElementById("deleteButton").addEventListener("mousedown",function(e){
  var element = document.getElementById("gd");
  element.classList.add("shake");

})

document.getElementById("deleteButton").addEventListener("mouseup",function(e){
  var element = document.getElementById("gd");
  element.classList.remove("shake");


})