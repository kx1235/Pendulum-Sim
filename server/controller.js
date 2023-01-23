const pendulum = require('./Pendulum.js');
const mqtt = require('./collisionService');

//default values for simulation 
let gravity = 9.81;
let timestep_ms = 50;
let temp = 5;
let intervalId;
let autoRestartID;

//saves properties of pendulum prior to simulation start to be restored after reset
let pRestoreProps;
let resetStatus = true;

//used for restoring correct velocity after pausing
let restoreVelocity = 0;

//handles updating pendulum properties
function updatePendulum(p,newProps){
    p.length = newProps.length;
    p.mass = newProps.mass;
    p.angle = newProps.angle;
    p.x = newProps.x;
    p.y = newProps.y;
    p.ballX = -Math.sin(newProps.angle) * newProps.length + newProps.x;
    p.ballY = Math.cos(newProps.angle) * newProps.length + newProps.y;
}


//starts simulation and makes calls to collisionService to check for collision
function startSimulation(p){
    mqtt.brokerClearAll();
    if(resetStatus){
        pRestoreProps = {
            x: p.x,
            y: p.y,
            angle: p.angle,
            mass: p.mass,
            length: p.length
        }
        resetStatus = false;
    }

    let velocity = restoreVelocity;
    let k = -gravity/temp;
    let timestep_s = timestep_ms / 1000;
    let timestamp = 0;
    intervalId = setInterval(function () {
        let acceleration = k * Math.sin(p.angle);
        velocity += acceleration * timestep_s;
        restoreVelocity = velocity;
        p.angle += velocity * timestep_s;
        p.ballX = -Math.sin(p.angle) * p.length + p.x;
        p.ballY = Math.cos(p.angle) * p.length + p.y;
        mqtt.publishPosition(p,timestamp);
        const res = mqtt.collisionCheck(p,timestamp);
        if (res == "STOP"){
            pauseSimulation();
            console.log("EMERGENCY STOP: RESTARTING IN 5s");
            mqtt.publishRestart(p);
            autoRestartID = setTimeout(() => {
                const restart = mqtt.checkRestart();
                if (restart){
                    console.log("restoring with");
                    console.log(pRestoreProps);
                    updatePendulum(p,pRestoreProps);
                    restoreVelocity = 0;
                    startSimulation(p);
                }
            },5000);
        }
        timestamp++
    }, timestep_ms);
}

//pauses simulation
function pauseSimulation(){
    clearInterval(intervalId);
    console.log("simulation paused");
}

//stops simulation and restores original properties of pendulum prior to simulation start
function resetSimulation(p){
    pauseSimulation();
    //stops any ongoing animation loops when resetting after collision occured
    clearTimeout(autoRestartID);
    updatePendulum(p,pRestoreProps);
    console.log("restored pendulum during reset with:");
    console.log(p);
    resetStatus = true;
    restoreVelocity = 0;
    console.log("simulation reset");
}

module.exports = {
    updatePendulum,
    startSimulation,
    pauseSimulation,
    resetSimulation
}