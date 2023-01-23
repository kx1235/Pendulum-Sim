class Pendulum{
    constructor(length,mass,angle,x,y,port,color){
        this.barThickness = 2;
        this.length = length;
        this.mass = mass;
        this.angle = angle;
        this.x = x;
        this.y = y;
        this.ballX = -Math.sin(this.angle) * this.length + x;
        this.ballY = Math.cos(this.angle) * this.length + y;
        this.id = port;
        this.color = color
    }


}

exports.Pendulum = Pendulum





