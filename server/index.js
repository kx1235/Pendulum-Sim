const express = require("express");
const cors = require("cors");
const pendulum = require('./Pendulum.js');
const routes = require('./routes.js');
const mqtt = require('./collisionService');
const PORT = parseInt(process.argv[2]);
const app = express();

app.use(express.json());
app.options("*", cors());
app.use(cors());

//setting pendulum default properties
let initY = 200;
let p;

if (PORT == "8080"){
    p = new pendulum.Pendulum(150, 30, Math.PI*40/180, 200, initY, PORT, "blue");
}
else if (PORT == "8090"){
    p = new pendulum.Pendulum(150, 30, Math.PI*40/180, 350, initY, PORT, "orange");
}
else if (PORT == "9000"){
    p = new pendulum.Pendulum(150, 30, Math.PI*40/180, 500, initY, PORT, "green");
}
else if (PORT == "9010"){
    p = new pendulum.Pendulum(150, 30, Math.PI*40/180, 650, initY, PORT, "purple");
}
else if (PORT == "9020"){
    p = new pendulum.Pendulum(150, 30, Math.PI*40/180, 800, initY, PORT, "red");
}


//mounts routes to the app
app.use('/', routes(p));

//connects server to mqtt broker
mqtt.connectToBroker();

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
