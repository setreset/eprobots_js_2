class Simulation {

    constructor(canvas, canvas2) {
        this.running = false;
        this.settings = new Settings();
        this.world = new World(this, this.settings.world_width,this.settings.world_height);
        this.active_objects = [];
        this.drawer = new Drawer(this, canvas, canvas2);
        this.draw_mode = 0;

        this.init_eprobots();
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

    set_draw_mode(dm){
        this.draw_mode = dm;
    }

    init_eprobots(){
        for (let i = 0; i<50;i++){
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
            let ep = new Eprobot(this, this.settings.nest_x+tools_random2(-20,20), this.settings.nest_y+tools_random2(-20,20), program, init_data);
            this.active_objects.push(ep);
        }
    }

    simulation_step(){
        let t_start = new Date().getTime();

        //if (this.world.counter_eprobot == 0){
        //    this.init_eprobots();
        //}

        let active_objects_next = [];

        //this.drawer.paint_fast();
        this.active_objects.forEach(function(o) {
            if (o.is_dead) return;
            if (o.tick < o.get_lifetime()){
                let new_life = o.step();
                if (new_life != null){
                    active_objects_next.push(new_life);
                }
                active_objects_next.push(o);
            }else{
                o.kill();
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
        if (this.settings.beam_at_borders){
            if (x_pos>=0){
                return x_pos % this.settings.world_width;
            }else{
                return this.settings.world_width - (Math.abs(x_pos) % this.settings.world_width);
            }
        }else{
            if (x_pos >= this.settings.world_width){
                return this.settings.world_width - 1;
            }else if (x_pos < 0){
                return 0;
            }else{
                return x_pos;
            }
        }

    }

    correct_pos_height(y_pos){
        if (this.settings.beam_at_borders) {
            if (y_pos >= 0) {
                return y_pos % this.settings.world_height;
            } else {
                return this.settings.world_height - (Math.abs(y_pos) % this.settings.world_height);
            }
        }else{
            if (y_pos >= this.settings.world_height){
                return this.settings.world_height - 1;
            }else if (y_pos < 0){
                return 0;
            }else{
                return y_pos;
            }
        }
    }
}