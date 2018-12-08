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

    stats_incr(key){
        if (key in this.stats){
            this.stats[key]++;
        }else{
            this.stats[key] = 1;
        }
    }

    stats_add(key, val){
        if (key in this.stats){
            this.stats[key] = this.stats[key] + val;
        }else{
            this.stats[key] = val;
        }
    }

    init(){
        this.settings = new Settings();
        this.world = new World(this, this.settings.world_width,this.settings.world_height);
        this.list_eprobots = [];
        this.list_eproboteaters = [];
        this.trace_objects = {};
        this.fossil_objects = [];
        this.stats = {};
        this.drawer = new Drawer(this, this.canvas, this.canvas2);
    }

    loadState(simstate){
        this.steps = simstate.steps;

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
            }else if (o.id == OBJECTTYPES.WATER.id){
                let w = new Water(this);
                w.energy_count = o.energy_count;
                this.world.world_set(w, o.x_pos, o.y_pos);
            }
        }, this);

        this.list_eprobots = [];
        this.list_eproboteaters = [];

        this.trace_objects = {};
        this.fossil_objects = [];
        this.stats = {};

        for (let o of simstate.list_eprobots) {
            let ep = new Eprobot(this, o.program, o.init_data);
            ep.tick = o.tick;
            ep.life_counter = o.life_counter;
            ep.energy = o.energy;
            ep.working_data = o.working_data;
            this.world.world_set(ep, o.x_pos, o.y_pos);
            this.list_eprobots.push(ep);
        }

        for (let o of simstate.list_eproboteaters) {
            let ep = new EprobotEater(this, o.program, o.init_data);
            ep.tick = o.tick;
            ep.life_counter = o.life_counter;
            ep.energy = o.energy;
            ep.working_data = o.working_data;
            this.world.world_set(ep, o.x_pos, o.y_pos);
            this.list_eproboteaters.push(ep);
        }

        for (var key in simstate.trace_objects){
            let trace_obj = simstate.trace_objects[key];
            if (trace_obj.id == OBJECTTYPES.TRACE_EPROBOT.id){
                let trace = new TraceEprobot(this, trace_obj.color);
                trace.created = trace_obj.created;
                this.world.world_set_trace_eprobot(trace, trace_obj.x_pos, trace_obj.y_pos);
                this.trace_objects[key] = trace;
            }else if (trace_obj.id == OBJECTTYPES.TRACE_EPROBOTEATER.id){
                let trace = new TraceEprobotEater(this, trace_obj.color);
                trace.created = trace_obj.created;
                this.world.world_set_trace_eproboteater(trace, trace_obj.x_pos, trace_obj.y_pos);
                this.trace_objects[key] = trace;
            }
        }

        for (let f_object of simstate.fossil_objects) {
            let f = new Fossil(this);
            f.created = f_object.created;
            this.world.world_set(f, f_object.x_pos, f_object.y_pos);

            this.fossil_objects.push(f);
        }

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
            steps: this.steps,
            settings: this.settings,
            world_objects: world_objects,
            list_eprobots: this.list_eprobots,
            list_eproboteaters: this.list_eproboteaters,
            trace_objects: this.trace_objects,
            fossil_objects: this.fossil_objects
        };
    }

    seed_eprobots(){
        for (let i = 0; i<75;i++){
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
                this.list_eprobots.push(ep);
            }
        }
    }

    seed_eproboteaters(){
        for (let i = 0; i<75;i++){
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
                let ep = new EprobotEater(this, program, init_data);
                this.world.world_set(ep, x, y);
                this.list_eproboteaters.push(ep);
            }
        }
    }

    seed_energy(){
        for (let i = 0; i<10;i++){
            let x = this.settings.nest_x+tools_random2(-20,20);
            let y = this.settings.nest_y+tools_random2(-20,20);
            if (this.world.get_terrain(x,y).energy_object==null){
                let p = new Plant(this);
                this.world.world_set_energy(p, x, y);
            }
        }
    }

    simulation_prestep(){
        if (this.world.counter_eprobot == 0 && this.world.counter_eproboteater == 0) {
            this.world.eprobots_created = 0;
            this.seed_eprobots();

            //console.log("died");
            //var duration = (new Date()-this.time_start)/1000;
            //console.log("duration seconds: "+duration);
            //console.log("steps: "+this.simulation.steps);
            //this.stop_simulation();
            //return;
        }else if (this.world.eprobots_created > this.settings.eprobots_max * 2 && this.world.counter_eproboteater == 0){
            this.seed_eproboteaters();
        }
    }

    simulation_step(){
        let list_eprobots_next = [];
        let list_eproboteaters_next = [];

        let eprobots_with_energy = [];
        let eproboteaters_with_energy = [];
        //shuffle(this.active_objects);

        for (let o of this.list_eprobots) {
            if (o.is_dead) continue;
            if (o.life_counter > 0){
                // INPUT
                o.set_input();

                o.step();

                if (o.afterstep_trace){
                    var key = "trace_eprobot " + o.afterstep_trace.t.x.toString()+":"+o.afterstep_trace.t.y.toString();
                    this.trace_objects[key] = o.afterstep_trace;
                }


                if (o.energy >= 1){
                    eprobots_with_energy.push(o);
                }
                list_eprobots_next.push(o);

            }else{
                this.world.world_unset(o.t.x, o.t.y, o.get_id());
                o.is_dead = true;
            }
        }

        for (let o of this.list_eproboteaters) {
            if (o.is_dead) continue;
            if (o.life_counter > 0){
                // INPUT
                o.set_input();

                o.step();

                if (o.afterstep_trace){
                    var key = "trace_eproboteater " + o.afterstep_trace.t.x.toString()+":"+o.afterstep_trace.t.y.toString();
                    this.trace_objects[key] = o.afterstep_trace;
                }

                if (o.energy >= 1){
                    eproboteaters_with_energy.push(o);
                }
                list_eproboteaters_next.push(o);

            }else{
                this.world.world_unset(o.t.x, o.t.y, o.get_id());
                o.is_dead = true;
            }
        }

        // absteigend sortieren
        //this.eprobots_with_energy.sort(function(a, b){return b.energy - a.energy});
        // aufsteigend sortieren
        //this.eprobots_with_energy.sort(function(a, b){return a.energy - b.energy});
        //shuffle(eprobots_with_energy);
        //shuffle(eproboteater_with_energy);

        // fork
        for (let o of eprobots_with_energy) {
            this.stats_incr("fork_normal");
            let new_eprobot = null;
            if (this.world.counter_eprobot<this.settings.eprobots_max){
                new_eprobot = o.fork();
                if (new_eprobot){
                    list_eprobots_next.push(new_eprobot);
                }
            }else{
                break;
            }
        }

        for (let o of eproboteaters_with_energy) {
            this.stats_incr("fork_eater");
            let new_eprobot = null;
            if (this.world.counter_eproboteater<this.settings.eprobots_max){
                new_eprobot = o.fork();
                if (new_eprobot){
                    list_eproboteaters_next.push(new_eprobot);
                }
            }else{
                break;
            }
        }

        this.list_eprobots = list_eprobots_next;
        this.list_eproboteaters = list_eproboteaters_next;

        if (this.steps % 10 == 0){
            var traces_to_remove = [];
            //console.log(Object.keys(this.trace_objects).length);
            // traces wegräumen
            for (var key in this.trace_objects){
                let trace = this.trace_objects[key];
                if (trace.created+this.settings.tracetime<this.steps){
                    //console.log("abgelaufen");
                    if (trace.get_id()==OBJECTTYPES.TRACE_EPROBOT.id){
                        this.world.world_unset_trace_eprobot(trace.t.x, trace.t.y);
                    }else if(trace.get_id()==OBJECTTYPES.TRACE_EPROBOTEATER.id){
                        this.world.world_unset_trace_eproboteater(trace.t.x, trace.t.y);
                    }

                    traces_to_remove.push(key);
                }
            }

            for (let trace_to_remove_key of traces_to_remove) {
                delete this.trace_objects[trace_to_remove_key];
            }
        }

        if (this.steps % 100 == 0){
            var fossils_next = [];
            //console.log(Object.keys(this.trace_objects).length);
            // fossils wegräumen
            for (let fossil of this.fossil_objects){
                if (fossil.created+this.settings.eprobots_fossiltime<this.steps){
                    //console.log("abgelaufen");
                    this.world.world_unset(fossil.t.x, fossil.t.y, fossil.get_id());
                }else{
                    fossils_next.push(fossil);
                }
            }

            this.fossil_objects = fossils_next;
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