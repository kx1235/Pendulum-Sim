var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

//used to correct for true canvas x,y bounds
const canvasRect = canvas.getBoundingClientRect();

const portList = ['8080','8090','9000','9010','9020']
// const portList = ['8080','8090','9000']
const pollFreq_ms = 50
let initPendulumProps = {
    8080: {},
    8090: {},
    9000: {},
    9010: {},
    9020: {}
}

//gets the initial properties of pendulums on servers, these properties are needed to set init slider values and drag & drop functionality
async function getInitProperties(){
    for(let i = 0; i < portList.length; i++){
        const res = await fetch(`http://localhost:${portList[i]}/pendulum`);
        const data = await res.json();
        initPendulumProps[data.id] = data
        console.log(initPendulumProps[data.id])
    }
}

//constantly gets pendulum data and draws it on the canvas 
function updateCanvas(){
    const poll = setInterval(async function(){
        var pendulumList = []
        for(let i = 0; i < portList.length; i++){
            const res = await fetch(`http://localhost:${portList[i]}/pendulum`);
            const data = await res.json();
            pendulumList.push(data);
        }
        drawPendulums(pendulumList)
    },pollFreq_ms)
}


//draws pendulums and grid lines
function drawPendulums(pendulumList) {
    context.save();
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 195, canvas.width, 10);

    for (let i = 0; i < pendulumList.length; i++){
        let p = pendulumList[i]
        context.save()
        context.translate(p.x, p.y);
        context.rotate(p.angle);
        context.fillStyle = p.color;
        context.globalCompositeOperation = "source-over";
        context.beginPath();
        context.rect(-p.barThickness, -p.barThickness, p.barThickness*2, p.length);
        context.fill();
        context.stroke();
        context.beginPath();
        context.arc(0, p.length, p.mass, 0, Math.PI*2, false);
        context.fill();
        context.stroke();
        context.restore();
    }
    
    context.fillStyle = 'gray';
    context.font = '12px Arial';
    
    // Draw horizontal grid lines and labels
for (let i = 0; i < canvas.height; i += 50) {
    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(canvas.width, i);
    context.stroke();
    context.fillText(i, 5, i);
  }

// Draw vertical grid lines and labels
for (let i = 0; i < canvas.width; i += 50) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, canvas.height);
    context.stroke();
    context.fillText(i, i, 10);
  }
}


//PROP SLIDER CONFIGS
let massSlider = document.querySelectorAll('.mass-slider');
let lengthSlider = document.querySelectorAll('.length-slider');
let angleSlider = document.querySelectorAll('.angle-slider');
let sliders = document.querySelectorAll("input");


//updates pendulum props on server
function updateProp(id){
    const req = fetch(`http://localhost:${id}/update-pendulum`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(initPendulumProps[id])
})
.then(response => response.json())
.then(data => {
    // console.log(data);
})
.catch(error => {
    console.log(error);
});

} 


//on page load, set slider values
async function initSetup(){
    await getInitProperties()
    massSlider.forEach(element => {
        element.value = initPendulumProps[element.id]['mass']
        document.querySelector(`#mass-${element.id}`).innerHTML = element.value + " px"
    })

    lengthSlider.forEach(element => {
        element.value = initPendulumProps[element.id]['length']
        document.querySelector(`#length-${element.id}`).innerHTML = element.value + " px"
    })
    angleSlider.forEach(element => {
        element.value = initPendulumProps[element.id]['angle'] * 180 / Math.PI
        document.querySelector(`#angle-${element.id}`).innerHTML = element.value + " degs"
    })
}


//for all sliders, on input event, update the props of the pendulum on the server
sliders.forEach(element =>{
    //add event listeners to change property values values on slider input
    element.addEventListener('input', function(e){
        if(element.className == "mass-slider"){
            initPendulumProps[element.id]['mass'] = Number(e.target.value);
            let span = document.querySelector(`#mass-${element.id}`)
            span.innerHTML = e.target.value + " px"
        }
        else if(element.className == "length-slider"){
            initPendulumProps[element.id]['length'] = Number(e.target.value);
            let span = document.querySelector(`#length-${element.id}`)
            span.innerHTML = e.target.value + " px"
        }
        else if (element.className == "angle-slider") {
            
            initPendulumProps[element.id]['angle'] = Math.PI * Number(e.target.value)/180;
            let span = document.querySelector(`#angle-${element.id}`)
            span.innerHTML = e.target.value + " degs"
        }
        updateProp(element.id)
    })
})



//tracking of mouse position
let initialX;
let initialY;
let currentlyDragging="none";


//CONTROL BUTTON CONFIGS
let startButton = document.getElementById('start');
let pauseButton = document.getElementById('pause');
let resetButton = document.getElementById('reset');
let controlButtons = document.querySelectorAll('.control-button')
pauseButton.disabled = true;
resetButton.disabled = true;

//request template for start/stop/reset
function controlRequest(type){
    for (let i = 0; i < portList.length; i++){
        const req = fetch(`http://localhost:${portList[i]}/${type}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({request:type})
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.log(error);
    });
    }
}

//add on click event listeners for each control button which sends the appropriate request to servers
controlButtons.forEach(element => {
    element.addEventListener('click',function(e){
        console.log(element.id)
        controlRequest(element.id);
        if (element.id == "start"){
            element.disabled = true
            pauseButton.disabled = false;
            resetButton.disabled = false
            sliders.forEach(element => {
                element.disabled = true
                currentlyDragging = "disabled"
            })
        }
        else if (element.id == "pause"){
            pauseButton.disabled = true;
            startButton.disabled = false;
            resetButton.disabled = false
        }
        else{
            resetButton.disabled = true
            pauseButton.disabled= true
            startButton.disabled = false
            sliders.forEach(element => {
                element.disabled = false
                currentlyDragging = "none"
            })
        }

    })
});

//add event listener for mousedown
canvas.addEventListener('mousedown', function(e) {
    initialX = e.clientX - canvasRect.left;
    initialY = e.clientY - canvasRect.top;
    console.log("mouse:" + e.clientX + "," + e.clientY)
    canvas.addEventListener('mousemove', updatePosition);
    canvas.addEventListener('mouseup',removeListeners);
});

//update the position of the pendulum based on the change in x coordinates
function updatePosition(e) {
    let mouseX = e.clientX - canvasRect.left;
    let mouseY = e.clientY - canvasRect.top;
    let changeX = mouseX - initialX;
    initialX = mouseX;
    initialY = mouseY;

    if (Math.abs(mouseX - initPendulumProps[8080]['x']) < 50 && Math.abs(mouseY - initPendulumProps[8080]['y']) < 50 && (currentlyDragging == "none" || currentlyDragging == 8080)){
        currentlyDragging = 8080
        console.log("here")
    }
    else if (Math.abs(mouseX - initPendulumProps[8090]['x']) < 50 && Math.abs(mouseY - initPendulumProps[8090]['y']) < 50 && (currentlyDragging == "none" || currentlyDragging == 8090)){
        currentlyDragging = 8090
    }
    else if(Math.abs(mouseX - initPendulumProps[9000]['x']) < 50 && Math.abs(mouseY - initPendulumProps[9000]['y']) < 50 && (currentlyDragging == "none" || currentlyDragging == 9000)){
        currentlyDragging = 9000
    }
    else if(Math.abs(mouseX - initPendulumProps[9010]['x']) < 50 && Math.abs(mouseY - initPendulumProps[9010]['y']) < 50 && (currentlyDragging == "none" || currentlyDragging == 9010)){
        currentlyDragging = 9010
    }
    else if(Math.abs(mouseX - initPendulumProps[9020]['x']) < 50 && Math.abs(mouseY - initPendulumProps[9020]['y']) < 50 && (currentlyDragging == "none" || currentlyDragging == 9020)){
        currentlyDragging = 9020
    }

    if(currentlyDragging != "none" && currentlyDragging != "disabled"){
        initPendulumProps[currentlyDragging]['x'] += changeX
        updateProp(currentlyDragging)
    }
    
}

//function to remove canvas event listeners when mouse is no longer held down
function removeListeners() {
    currentlyDragging="none"
    canvas.removeEventListener('mousemove', updatePosition);
    canvas.removeEventListener('mouseup', removeListeners);
}

//on page load perform setup and begin polling servers to update canvas
initSetup();
updateCanvas();




