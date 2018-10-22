class Simulation {

    constructor(canvas, canvas2) {
        this.canvas = canvas;
        this.canvas2 = canvas2;
        this.steps = 0;

        sim = this;
    }

    prepare(){
        for (var i=0;i<this.settings.world_height; i++){
            let b = new Barrier(this);
            this.world.world_set(b, this.settings.world_width/2, i);
        }
    }

    statsinit(){
        return {
            "eprobots_created": 0,
            "high_stepcounter": 0,
            "fork_water": 0,
            "fork_normal": 0,
            "infinity_negative": 0,
            "infinity_positive": 0,
            "infinity_nan": 0
        }
    }

    init(){
        this.settings = new Settings();
        this.world = new World(this, this.settings.world_width,this.settings.world_height);
        this.active_objects = [];
        this.trace_objects = {};
        this.stats = this.statsinit();
        this.drawer = new Drawer(this, this.canvas, this.canvas2);
    }

    loadState(simstate){
        this.settings = new Settings();
        this.settings.loadState(simstate.settings);

        this.world = new World(this, this.settings.world_width,this.settings.world_height);

        this.drawer = new Drawer(this, this.canvas, this.canvas2);

        simstate.world_objects.forEach(function(o) {
            if (o.id == OBJECTTYPES.PLANT.id){
                let p = new Plant(this);
                p.energy_count = o.energy_count;
                this.world.world_set_energy(p, o.x_pos, o.y_pos);
            }else if (o.id == OBJECTTYPES.BARRIER.id){
                let b = new Barrier(this);
                this.world.world_set(b, o.x_pos, o.y_pos);
            }
        }, this);

        this.active_objects = [];
        this.trace_objects = {};
        this.stats = this.statsinit();

        simstate.active_objects.forEach(function(o) {
            let ep = new Eprobot(this, o.program, o.init_data);
            ep.tick = o.tick;
            ep.energy = o.energy;
            ep.working_data = o.working_data;
            this.world.world_set(ep, o.x_pos, o.y_pos);
            this.active_objects.push(ep);
        }, this);

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
        // collect world objects
        let world_objects = [];
        for (var x=0;x<this.settings.world_width;x++){
            for (var y=0;y<this.settings.world_height;y++){
                let t = this.world.get_terrain(x, y);
                if (t.energy_object){
                    world_objects.push(t.energy_object);
                }
                if (t.slot_object && t.slot_object.get_id() == OBJECTTYPES.BARRIER.id){
                    world_objects.push(t.slot_object);
                }
            }
        }

        return {
            settings: this.settings,
            world_objects: world_objects,
            active_objects: this.active_objects
        };
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
            if (this.world.get_terrain(x,y).slot_object==null){
                let ep = new Eprobot(this, program, init_data);
                this.world.world_set(ep, x, y);
                this.active_objects.push(ep);
            }
        }
    }

    simulation_step(){
        let active_objects_next = [];

        //this.drawer.paint_fast();
        let eprobots_with_energy_and_water = [];
        let eprobots_with_energy = [];
        shuffle(this.active_objects);
        for (let o of this.active_objects) {
            if (o.is_dead) return;
            if (o.tick < o.get_lifetime()){
                // INPUT
                o.set_input();

                o.step();

                if (o.afterstep_trace){
                    var key = o.afterstep_trace.t.x.toString()+":"+o.afterstep_trace.t.y.toString();
                    this.trace_objects[key] = o.afterstep_trace;
                }

                if (o.energy >= 1 && o.water >= 1){
                    eprobots_with_energy_and_water.push(o);
                } else if (o.energy >= 1){
                    eprobots_with_energy.push(o);
                }
                active_objects_next.push(o);

            }else{
                this.world.world_unset(o.t.x, o.t.y, o.get_id());
                o.is_dead = true;
            }
        }

        // absteigend sortieren
        //this.eprobots_with_energy.sort(function(a, b){return b.energy - a.energy});
        // aufsteigend sortieren
        //this.eprobots_with_energy.sort(function(a, b){return a.energy - b.energy});
        shuffle(eprobots_with_energy);
        shuffle(eprobots_with_energy_and_water);

        // fork
        for (let o of eprobots_with_energy_and_water) {
            this.stats["fork_water"]++;
            let new_eprobot = null;
            if (this.world.counter_eprobot<this.settings.eprobots_max){
                new_eprobot = o.fork();
                if (new_eprobot){
                    active_objects_next.push(new_eprobot);
                }
            }else{
                break;
            }
        }

        for (let o of eprobots_with_energy) {
            this.stats["fork_normal"]++;
            let new_eprobot = null;
            if (this.world.counter_eprobot<this.settings.eprobots_max){
                new_eprobot = o.fork();
                if (new_eprobot){
                    active_objects_next.push(new_eprobot);
                }
            }else{
                break;
            }
        }

        this.active_objects = active_objects_next;

        if (this.steps % 10 == 0){
            var traces_to_remove = [];
            //console.log(Object.keys(this.trace_objects).length);
            // traces wegräumen
            for (var key in this.trace_objects){
                let trace = this.trace_objects[key];
                if (trace.created+750<this.steps){
                    //console.log("abgelaufen");
                    this.world.world_unset_trace(trace.t.x, trace.t.y);
                    traces_to_remove.push(key);
                }
            }

            for (let trace_to_remove_key of traces_to_remove) {
                delete this.trace_objects[trace_to_remove_key];
            }
        }

        this.steps++;
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

    get_object_types(){
        return OBJECTTYPES;
    }

    click_world(world_x, world_y, draw_mode){
        let t = this.world.get_terrain(world_x, world_y);

        if (draw_mode == OBJECTTYPES.PLANT.id){
            if (t.energy_object == null){
                let p = new Plant(this);
                this.world.world_set_energy(p, world_x, world_y);
                //simulation.active_objects.push(p);
                this.drawer.paint_fast();
            }else{
                console.log("besetzt");
            }
        }else if (draw_mode == OBJECTTYPES.WATER.id){
            if (t.energy_object == null){
                let w = new Water(this);
                this.world.world_set_energy(w, world_x, world_y);
                //simulation.active_objects.push(p);
                this.drawer.paint_fast();
            }else{
                console.log("besetzt");
            }
        }else if (draw_mode == OBJECTTYPES.BARRIER.id){
            if (t.slot_object == null){
                let b = new Barrier(this);
                this.world.world_set(b, world_x, world_y);
                //simulation.active_objects.push(p);
                this.drawer.paint_fast();
            }else{
                console.log("besetzt");
            }
        }
    }
}