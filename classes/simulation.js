class Simulation {

    constructor(canvas, canvas2) {
        this.running = false;
        this.settings = new Settings();
        this.world = new World(this.settings.world_width,this.settings.world_height);
        this.active_objects = [];
        this.drawer = new Drawer(this, canvas, canvas2);

        //let ep = new Eprobot(this, 0, 0);
        //this.active_objects.push(ep);
    }

    startSimulation(){
        this.running = true;
        this.simulation_step();
    }

    stopSimulation(){
        this.running = false;
    }

    getRunning(){
        return this.running;
    }

    simulation_step(){
        let t_start = new Date().getTime();

        let active_objects_next = [];

        //this.drawer.paint();
        this.active_objects.forEach(function(el) {
            if (el.lifetime <= this.settings.plants_lifetime){
                let new_plant = el.step();
                if (new_plant != null){
                    active_objects_next.push(new_plant);
                }
                active_objects_next.push(el);
            }else{
                this.world.world_unset(el.x_pos, el.y_pos);
                this.world.counter_plant--;
            }
        }, this);

        this.active_objects = active_objects_next;

        let t_end = new Date().getTime();
        let frame_time = t_end-t_start;

        this.drawer.paint();

        if (this.running) {
            let st = this.settings.sleeptime - frame_time;
            setTimeout(()=>{this.simulation_step()}, st);
        }
    }

    correct_pos_width(x_pos){
        if (x_pos>=0){
            return x_pos % this.settings.world_width;
        }else{
            return this.settings.world_width - (Math.abs(x_pos) % this.settings.world_width);
        }
    }

    correct_pos_height(y_pos){
        if (y_pos>=0){
            return y_pos % this.settings.world_height;
        }else{
            return this.settings.world_height - (Math.abs(y_pos) % this.settings.world_height);
        }
    }
}