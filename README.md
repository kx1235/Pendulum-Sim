**DEMO VIDEO LINK**

<https://vimeo.com/791967700/1435ba523b>

# Documentation: Pendulum Simulator

**By: Kenneth Xu**

**Overview**

The pendulum simulator allows users to configure and simulate the movement of 5 unique pendulums. Each pendulum resides own its on server and can be modified by the user via the UI. More specifically a user can perform the following actions:

1. Adjust pendulum properties
   1. Position of pendulum (click tip of pendulum stem and drag left/right)
   2. Mass (aka radius of pendulum ball)
   3. Length of stem
   4. Angle
2. Start the simulation
3. Pause the simulation
4. Stop and reset the simulation (will reset pendulums to their original properties)


**Getting Started**

1. Ensure a MQTT broker service is running on ‘mqtt://locahost:1883’, Mosquitto MQTT broker was used during development
2. Run start.bat file (located in ‘server’ folder)
3. Open index.html (located in ‘client’ folder) in a browser

**REST Interface**

There are a few endpoints that the frontend client can call to the backend. These URLs can be found in server > routes.js:

**‘/pendulum’ [GET]** : returns the properties of a pendulum in JSON format

**‘/update-pendulum’ [POST]** : sends new pendulum properties to be updated with

**‘/start’ [POST]** : starts simulation

**‘/pause’ [POST]** : pauses simulation

**‘/reset’ [POST]** : stops simulation and resets pendulum to its original properties

**Backend File Explanations**

**index.js :** Instantiates a Pendulum object, connects to Mosquitto MQTT broker and mounts routes to the app

**routes.js :** Handles API calls and routes to appropriate controller functions

**controller.js :** Functions that handle all aspects of simulation (simulation runs at 20 FPS, every 50ms)

**collisionService.js :** Performs collision checks and publishing/subscribing of messages to MQTT broker

**Pendulum.js :** Class definition of the Pendulum object
