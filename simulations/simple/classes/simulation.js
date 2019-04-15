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

        this.reduce_traces_tries = parseInt((this.settings.world_width * this.settings.world_height)/518);
        console.log("reduce_traces_tries: "+this.reduce_traces_tries);

        this.world = new World(this, this.settings.world_width,this.settings.world_height);
        this.list_eprobots = [];
        this.list_eproboteaters = [];
        this.list_plants = [];
        this.stats = {};
        this.drawer = new Drawer(this, this.canvas, this.canvas2);
    }

    loadState(simstate){
        this.steps = simstate.steps;

        this.settings = new Settings();
        this.settings.loadState(simstate.settings);

        this.world = new World(this, this.settings.world_width,this.settings.world_height);

        this.drawer = new Drawer(this, this.canvas, this.canvas2);

        for (let o of simstate.world_objects) {
            if (o.id == OBJECTTYPES.BARRIER.id){
                let b = new Barrier(this);
                this.world.world_set(b, o.x_pos, o.y_pos);
            }
        }

        this.list_eprobots = [];
        this.list_eproboteaters = [];
        this.list_plants = [];

        this.trace_objects = {};
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

        for (let o of simstate.list_plants) {
            let p = new Plant(this);
            p.is_dead = o.is_dead;
            p.energy_count = o.energy_count;

            this.world.world_set_energy(p, o.x_pos, o.y_pos);
            this.list_plants.push(p);
        }
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
            list_plants: this.list_plants,
            trace_objects: this.trace_objects
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
            //let x = this.settings.nest_x+tools_random2(-20,20);
            //let y = this.settings.nest_y+tools_random2(-20,20);
            let x = tools_random(this.settings.world_width);
            let y = tools_random(this.settings.world_height);
            if (this.world.get_terrain(x,y).slot_object==null){
                let ep = new Eprobot(this, program, init_data, this.settings.MUTATE_POSSIBILITY, this.settings.MUTATE_STRENGTH);
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
            //let x = this.settings.nest_x+tools_random2(-20,20);
            //let y = this.settings.nest_y+tools_random2(-20,20);
            let x = tools_random(this.settings.world_width);
            let y = tools_random(this.settings.world_height);
            if (this.world.get_terrain(x,y).slot_object==null){
                let ep = new EprobotEater(this, program, init_data, this.settings.MUTATE_POSSIBILITY, this.settings.MUTATE_STRENGTH);
                this.world.world_set(ep, x, y);
                this.list_eproboteaters.push(ep);
            }
        }
    }

    seed_energy(){
        for (let i = 0; i<10;i++){
            let x = tools_random(this.settings.world_width);
            let y = tools_random(this.settings.world_height);
            if (this.world.get_terrain(x,y).energy_object==null){
                let p = new Plant(this);
                this.world.world_set_energy(p, x, y);
                this.list_plants.push(p);
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

    //reduce_traces(trace_set, trace_list){
    //    let tl = trace_list.length;
    //    if (tl > 0){
    //        let trace_cnt = 0;
    //        //let traces_list = [...trace_set];
    //        let num_tries = Math.min(tl / 100,5);
    //
    //        while(trace_cnt<num_tries){
    //            let cand_index = tools_random(tl);
    //            let cand_trace = trace_list[cand_index];
    //
    //            if (cand_trace.trace_eprobot>0){
    //                cand_trace.trace_eprobot = 0;
    //                /*cand_trace.trace_eprobot -= 2000;
    //                if (cand_trace.trace_eprobot<=0){
    //                    cand_trace.trace_eprobot = 0;
    //                }*/
    //            }
    //
    //            if (cand_trace.trace_eproboteater>0){
    //                cand_trace.trace_eproboteater = 0;
    //                /*cand_trace.trace_eproboteater -= 2000;
    //                if (cand_trace.trace_eproboteater<=0){
    //                    cand_trace.trace_eproboteater = 0;
    //                }*/
    //            }
    //
    //            this.drawer.refresh_paintobj(cand_trace.x, cand_trace.y, cand_trace.get_color());
    //
    //            if (cand_trace.trace_eprobot == 0 && cand_trace.trace_eproboteater == 0){
    //                trace_set.delete(cand_trace);
    //                trace_list.splice(cand_index, 1);
    //                tl--;
    //                if (tl==0){
    //                    break;
    //                }
    //            }
    //
    //            trace_cnt++;
    //        }
    //    }
    //}

    reduce_traces_fast(){
        for (let i=0;i<this.reduce_traces_tries;i++){
            let x = tools_random(this.settings.world_width);
            let y = tools_random(this.settings.world_height);
            let cand_terrain = this.world.get_terrain(x,y);

            let reduced = false;

            if (cand_terrain.trace_eprobot > 0 && cand_terrain.trace_eprobot_expiry < this.steps){
                cand_terrain.trace_eprobot -= 200;
                if (cand_terrain.trace_eprobot<=0){
                    cand_terrain.trace_eprobot = 0;
                }
                reduced = true;
            }

            if (cand_terrain.trace_eproboteater > 0 && cand_terrain.trace_eproboteater_expiry < this.steps){
                cand_terrain.trace_eproboteater -= 200;
                if (cand_terrain.trace_eproboteater<=0){
                    cand_terrain.trace_eproboteater = 0;
                }
                reduced = true;
            }

            if (cand_terrain.poison > 0 && cand_terrain.poison_expiry < this.steps){
                cand_terrain.poison = 0;
                reduced = true;
            }

            if (cand_terrain.info > 0 && cand_terrain.info_expiry < this.steps){
                cand_terrain.info = 0;
                reduced = true;
            }

            if (reduced){
                this.drawer.refresh_paintobj(cand_terrain.x, cand_terrain.y, cand_terrain.get_color());
            }
        }
    }

    process_eprobots(list_eprobots){
        let list_eprobots_next = [];
        let eprobots_with_energy = [];

        //shuffle(this.active_objects);

        for (let o of list_eprobots) {
            if (o.is_dead) continue;
            if (o.life_counter > 0){
                // INPUT
                o.set_input();

                o.step();

                if (o.energy >= o.get_fork_energy()){
                    eprobots_with_energy.push(o);
                }
                list_eprobots_next.push(o);

            }else{
                this.world.world_unset(o.t.x, o.t.y, o.get_id());
                o.kill();
            }
        }

        return {
            "list_eprobots_next": list_eprobots_next,
            "eprobots_with_energy": eprobots_with_energy
        };
    }

    fork_eprobots(eprobots_with_energy, counter_eprobot, list_eprobots_next){
        for (let o of eprobots_with_energy) {
            let new_eprobot = null;
            if (this.world[counter_eprobot]< o.get_individuum_max()){
                new_eprobot = o.fork();
                if (new_eprobot){
                    list_eprobots_next.push(new_eprobot);
                }
            }else{
                break;
            }
        }
    }

    simulation_step(){
        let r_eprobots = this.process_eprobots(this.list_eprobots);
        let eprobots_with_energy = r_eprobots.eprobots_with_energy;
        let list_eprobots_next = r_eprobots.list_eprobots_next;

        let r_eproboteaters = this.process_eprobots(this.list_eproboteaters);
        let eproboteaters_with_energy = r_eproboteaters.eprobots_with_energy;
        let list_eproboteaters_next = r_eproboteaters.list_eprobots_next;

        // absteigend sortieren
        //this.eprobots_with_energy.sort(function(a, b){return b.energy - a.energy});
        // aufsteigend sortieren
        //this.eprobots_with_energy.sort(function(a, b){return a.energy - b.energy});
        //shuffle(eprobots_with_energy);
        //shuffle(eproboteater_with_energy);

        // fork
        this.fork_eprobots(eprobots_with_energy, "counter_eprobot", list_eprobots_next);
        this.fork_eprobots(eproboteaters_with_energy, "counter_eproboteater", list_eproboteaters_next);

        this.list_eprobots = list_eprobots_next;
        this.list_eproboteaters = list_eproboteaters_next;

        if (this.world.counter_plant > 0 && this.world.counter_plant < this.settings.plants_max){
            let list_plants_next = [];
            let plant_cnt = 0;
            let num_tries = this.settings.plants_max / 10;
            while(plant_cnt < num_tries && this.world.counter_plant < this.settings.plants_max){
                let cand_index = tools_random(this.list_plants.length);
                let cand_plant = this.list_plants[cand_index];
                if (cand_plant.is_dead){
                    this.list_plants.splice(cand_index, 1);
                }else{
                    let new_plant = cand_plant.fork();
                    if (new_plant){
                        list_plants_next.push(new_plant);
                    }
                }

                plant_cnt++;
            }
            this.list_plants.push(...list_plants_next);
        }

        // traces wegräumen
        //this.reduce_traces(this.traces_set_eprobots, this.traces_list_eprobots);
        //this.reduce_traces(this.traces_set_eproboteaters, "trace_eproboteater", this.traces_list_eproboteaters);
        if (this.settings.feature_traces || this.settings.feature_poison || this.settings.feature_info){
            this.reduce_traces_fast();
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
            return Math.min(Math.max(0,x_pos), this.settings.world_width-1);
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
            return Math.min(Math.max(0,y_pos), this.settings.world_height-1);
        }
    }

    get_object_types(){
        return OBJECTTYPES;
    }

    click_world(world_x, world_y, draw_mode){
        let t = this.world.get_terrain(world_x, world_y);
        console.log(t);

        if (draw_mode == OBJECTTYPES.PLANT.id){
            if (t.energy_object == null){
                let p = new Plant(this);
                this.world.world_set_energy(p, world_x, world_y);
                this.list_plants.push(p);
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