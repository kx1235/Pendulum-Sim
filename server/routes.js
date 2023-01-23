const express = require("express");
const router = express.Router();
const controller = require('./controller.js');


module.exports = function(p){
    //[GET] request for pendulum properties
    router.get('/pendulum', (req,res) => {
        res.json({
            id: p.id,
            x: p.x,
            y: p.y,
            angle: p.angle,
            mass: p.mass,
            length: p.length,
            barThickness: p.barThickness,
            ballX: p.ballX,
            ballY: p.ballY,
            color: p.color
        });
    });

    //[POST] request for updating pendulum properties
    router.post('/update-pendulum',(req,res) => {
        const newProps = req.body;
        console.log("Updating pendulum with user defined props:");
        console.log(newProps);
        controller.updatePendulum(p,newProps);
        res.status(200).json({newProperties:{
            id: p.id,
            x: p.x,
            y: p.y,
            angle: p.angle,
            mass: p.mass,
            length: p.length,
            barthickness: p.barthickness
        }})
    })

    //[POST] request for starting simulation
    router.post('/start',(req,res) => {
        controller.startSimulation(p);
        res.status(200).json({message:"Simulation started for " + p.id});
    });

    //[POST] request for pausing simulation
    router.post('/pause',(req,res) => {
        controller.pauseSimulation(p);
        res.status(200).json({message:"Simulation paused for " + p.id});
    });

    //[POST] request for stopping simulation and resetting to original values prior simulation start
    router.post('/reset',(req,res) => {
        controller.resetSimulation(p);
        res.status(200).json({message:"Simulation reset for " + p.id + " and restored properties"});
        
    });


    return router
}
