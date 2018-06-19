class Simulation {

    constructor(canvas, canvas2) {
        this.running = false;
        this.settings = new Settings();
        this.world = new World(this.settings.world_width,this.settings.world_height);
        this.active_objects = [];
        this.drawer = new Drawer(this, canvas, canvas2);

        var program = [];
        for (var pi = 0; pi < this.settings.PROGRAM_LENGTH; pi++) {
            var val = tools_random(this.settings.PROGRAM_LENGTH * 10) - this.settings.PROGRAM_LENGTH;
            program.push(val);
        }

        var init_data = [];
        for (var di = 0; di < this.settings.DATA_LENGTH; di++) {
            var val = tools_random2(-720, 720);
            init_data.push(val);
        }

        let ep = new Eprobot(this, 10, 10, program, init_data);
        this.active_objects.push(ep);
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

        //this.drawer.paint_fast();
        this.active_objects.forEach(function(el) {
            if (el.is_dead) return;
            if (el.lifetime < el.get_lifetime()){
                let new_life = el.step();
                if (new_life != null){
                    active_objects_next.push(new_life);
                }
                active_objects_next.push(el);
            }else{
                el.kill();
            }
        }, this);

        this.active_objects = active_objects_next;

        let t_end = new Date().getTime();
        let frame_time = t_end-t_start;

        this.drawer.paint_fast();

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