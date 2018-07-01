class Simulation {

    constructor(canvas, canvas2) {
        this.running = false;
        this.draw_mode = 0;
    }

    init(){
        this.settings = new Settings();
        this.world = new World(this, this.settings.world_width,this.settings.world_height);
        this.active_objects = [];
        this.drawer = new Drawer(this, canvas, canvas2);
    }

    loadState(simstate){
        this.settings = new Settings();
        this.settings.loadState(simstate.settings);

        //this.world = new World(this);
        //this.world.loadState(simstate.world);

        //
        //eprobots_h = [];
        //eprobots_c = [];
        //
        //for (var i = 0; i< simstate.eprobots_h.length; i++){
        //    var e_state = simstate.eprobots_h[i];
        //    var e = new Herbivore(sim, e_state.x_pos, e_state.y_pos, e_state.init_programm);
        //    e.loadState(e_state);
        //    eprobots_h.push(e);
        //}
    }

    toJSON(){
        return {
            settings: this.settings,
            world: this.world,
            active_objects: this.active_objects,
        };
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
            let x = this.settings.nest_x+tools_random2(-20,20);
            let y = this.settings.nest_y+tools_random2(-20,20);
            let ep = new Eprobot(this, program, init_data);
            this.world.world_set(ep, x, y);
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
                let x_pos_before = o.t.x;
                let y_pos_before = o.t.y;

                o.working_data[this.settings.DATA_LENGTH-4] = o.tick;
                o.working_data[this.settings.DATA_LENGTH-3] = o.energy;

                o.step();

                if (x_pos_before != o.t.x){
                    o.working_data[this.settings.DATA_LENGTH-2] = 1;
                }else{
                    o.working_data[this.settings.DATA_LENGTH-2] = 0;
                }
                if (y_pos_before != o.t.y){
                    o.working_data[this.settings.DATA_LENGTH-1] = 1;
                }else{
                    o.working_data[this.settings.DATA_LENGTH-1] = 0;
                }

                if (o.new_eprobot){
                    active_objects_next.push(o.new_eprobot);
                    o.new_eprobot = null;
                }
                active_objects_next.push(o);
            }else{
                this.world.world_unset(o.t.x, o.t.y, o.get_id());
                o.is_dead = true;
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