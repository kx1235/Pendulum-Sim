const mqtt = require('mqtt');
const TOPIC = 'collisionCheck';
let client;
let messageQueue = [];
let restartCount = 0;
let stopFlag = false;

//Establishes connection to broker and subscribes to topic, handles receipt of priority messages: STOP and RESTART
function connectToBroker(){
    client = mqtt.connect('mqtt://localhost:1883');
    client.on('connect', () => {
        console.log('Connected to broker');
        client.subscribe(TOPIC);
      });

    client.on('message', (topic, message) => {
    let messageArray = message.toString().split(":");
    let type = messageArray[0];
    if (type == "STOP"){
        stopFlag = true;
    }
    else if (type == "RESTART"){
        restartCount++;
    }

    //pushes message to queue for processing
    messageQueue.push(message.toString());
    });
}

//message templates for different message types: POSITION, STOP, RESTART
function publishPosition(p,timestamp){
    client.publish(TOPIC,`POSITION:${p.id}:${timestamp}:${p.ballX}:${p.ballY}:${p.mass}`)
}

function publishStop(p){
    client.publish(TOPIC,`STOP:${p.id}`)
}

function publishRestart(p){
    client.publish(TOPIC,`RESTART:${p.id}`)
}

//checks if 5 RESTART messages are recieved
function checkRestart(){
    if (restartCount >= 5){
        brokerClearAll();
        return true
    }
}

//handles message processing to detect for collisions
function collisionCheck(p,timestamp){

    if(stopFlag){
        return "STOP"
    }

    for (let i = 0; i < messageQueue.length; i++){
        let messageArray = messageQueue[i].split(":");
        let type = messageArray[0];
        if (type == "POSITION"){
            const neighborID = Number(messageArray[1]);
            const neighborTimestamp = Number(messageArray[2]);
            const neighborX = parseFloat(messageArray[3]);
            const neighborY = parseFloat(messageArray[4]);
            const neighborMass = parseFloat(messageArray[5]);
            let distance = Math.sqrt(Math.pow(neighborX - p.ballX,2) + Math.pow(neighborY - p.ballY,2));
            //tolerance is distance buffer
            let tolerance = 15;

            if (Math.abs(neighborTimestamp - timestamp) <= 3 && neighborID != p.id && distance < (p.mass + neighborMass + tolerance)){
                publishStop(p)
                console.log("published: STOP, collision with " + neighborID + " at " + p.ballX + " " + p.ballY + " at timestamp " + timestamp + " neightbor time " + neighborTimestamp)
                return "STOP"
            }
        }
        else{
            return "CONTINUE"
        }
    }
    //clearing message Queue
    messageQueue = []
}

//Clears out old messages/states and resets restart count
function brokerClearAll(){
    messageQueue = []
    restartCount = 0
    stopFlag = false;
}

module.exports = {
    connectToBroker,
    publishPosition,
    publishStop,
    publishRestart,
    collisionCheck,
    checkRestart,
    brokerClearAll
}
